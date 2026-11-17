import { getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { BasemapMode } from './data/clpsMissions';

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export const SITE_CONSTRAINTS = {
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  ID_MAX_LEN: 128,
  NAME_MAX_LEN: 60,
  NOTES_MAX_LEN: 400,
  UTC_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/,
  BASEMAPS: ['wac', 'lola', 'hazard', 'quantized'] as const,
};

export interface SavedLunarSite {
  id: string;
  ownerId: string;
  name: string;
  latDeg: number;
  lonDeg: number;
  elevationM: number;
  dateTimeUtc: string;
  basemapMode: BasemapMode;
  notes: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface SaveLunarSiteInput {
  name: string;
  latDeg: number;
  lonDeg: number;
  elevationM: number;
  dateTimeUtc: string;
  basemapMode: BasemapMode;
  notes: string;
}

function sanitizeSiteInput(input: SaveLunarSiteInput) {
  const safeName = input.name.trim().slice(0, SITE_CONSTRAINTS.NAME_MAX_LEN) || 'Saved Lunar Site';
  const safeLat = Number.isFinite(input.latDeg)
    ? Number(Math.max(-90, Math.min(90, input.latDeg)).toFixed(4))
    : 0;
  const safeLon = Number.isFinite(input.lonDeg)
    ? Number(Math.max(-180, Math.min(180, input.lonDeg)).toFixed(4))
    : 0;
  const safeElev = Number.isFinite(input.elevationM)
    ? Math.round(Math.max(-12000, Math.min(20000, input.elevationM)))
    : 0;
  const safeUtc = SITE_CONSTRAINTS.UTC_PATTERN.test(input.dateTimeUtc)
    ? input.dateTimeUtc
    : new Date().toISOString().slice(0, 16);
  const safeBasemap: BasemapMode = SITE_CONSTRAINTS.BASEMAPS.includes(input.basemapMode)
    ? input.basemapMode
    : 'wac';
  const safeNotes = input.notes.trim().slice(0, SITE_CONSTRAINTS.NOTES_MAX_LEN);

  return {
    name: safeName,
    latDeg: safeLat,
    lonDeg: safeLon,
    elevationM: safeElev,
    dateTimeUtc: safeUtc,
    basemapMode: safeBasemap,
    notes: safeNotes,
  };
}

export async function signInWithFirebaseGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function syncUserPrivateProfile(user: User): Promise<void> {
  if (!user.emailVerified || !user.email) return;
  const profilePath = `users/${user.uid}/private/profile`;
  const profileRef = doc(db, 'users', user.uid, 'private', 'profile');

  const safeDisplayName = (user.displayName || user.email.split('@')[0] || 'Lunar Explorer')
    .trim()
    .slice(0, 80);
  const safeEmail = user.email.trim().slice(0, 254);

  let exists = false;
  try {
    const snap = await getDoc(profileRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  if (!exists) {
    try {
      await setDoc(profileRef, {
        uid: user.uid,
        email: safeEmail,
        displayName: safeDisplayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, profilePath);
    }
  } else {
    try {
      await updateDoc(profileRef, {
        email: safeEmail,
        displayName: safeDisplayName,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  }
}

export function subscribeSavedSites(
  userId: string,
  onData: (sites: SavedLunarSite[]) => void,
  onError: (err: Error) => void
): () => void {
  const collectionPath = `users/${userId}/sites`;
  const q = query(collection(db, 'users', userId, 'sites'), where('ownerId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: SavedLunarSite[] = snapshot.docs.map((d) => {
        const data = d.data();
        const createdTs = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
        const updatedTs = data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : createdTs;
        return {
          id: d.id,
          ownerId: String(data.ownerId || userId),
          name: String(data.name || 'Saved Lunar Site'),
          latDeg: Number(data.latDeg ?? 0),
          lonDeg: Number(data.lonDeg ?? 0),
          elevationM: Number(data.elevationM ?? 0),
          dateTimeUtc: String(data.dateTimeUtc || ''),
          basemapMode: (data.basemapMode as BasemapMode) || 'wac',
          notes: String(data.notes || ''),
          createdAtMs: createdTs,
          updatedAtMs: updatedTs,
        };
      });
      rows.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function saveLunarSite(userId: string, input: SaveLunarSiteInput): Promise<string> {
  const siteId = `site_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!SITE_CONSTRAINTS.ID_PATTERN.test(siteId)) {
    throw new Error('Invalid generated site ID');
  }
  const path = `users/${userId}/sites/${siteId}`;
  const clean = sanitizeSiteInput(input);

  try {
    await setDoc(doc(db, 'users', userId, 'sites', siteId), {
      ownerId: userId,
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return siteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLunarSite(
  userId: string,
  siteId: string,
  input: SaveLunarSiteInput
): Promise<void> {
  if (!SITE_CONSTRAINTS.ID_PATTERN.test(siteId) || siteId.length > SITE_CONSTRAINTS.ID_MAX_LEN) {
    throw new Error('Invalid site ID');
  }
  const path = `users/${userId}/sites/${siteId}`;
  const clean = sanitizeSiteInput(input);

  try {
    await updateDoc(doc(db, 'users', userId, 'sites', siteId), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLunarSite(userId: string, siteId: string): Promise<void> {
  if (!SITE_CONSTRAINTS.ID_PATTERN.test(siteId) || siteId.length > SITE_CONSTRAINTS.ID_MAX_LEN) {
    throw new Error('Invalid site ID');
  }
  const path = `users/${userId}/sites/${siteId}`;

  try {
    await deleteDoc(doc(db, 'users', userId, 'sites', siteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
