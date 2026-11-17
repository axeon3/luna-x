import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth as sharedFirebaseAuth } from '../firebase';

export type SessionRole = 'observer' | 'operator' | 'admin';

export interface DynamicScopeSpec {
  scope: string;
  capability: string;
  service: 'drive' | 'gmail';
  label: string;
  description: string;
  privilegeLevel: 'read' | 'write' | 'elevated';
  minRole: SessionRole;
}

export const SESSION_ROLE_INFO: Record<
  SessionRole,
  { label: string; description: string; rank: number }
> = {
  observer: {
    label: 'Observer',
    description: 'Read-only metadata, file inspection, and mailbox reading.',
    rank: 1,
  },
  operator: {
    label: 'Flight Controller',
    description: 'Read + create app exports, field notes, drafts, and send telemetry dispatches.',
    rank: 2,
  },
  admin: {
    label: 'Mission Admin',
    description: 'Full dynamic capabilities including rename, archive, trash, and delete.',
    rank: 3,
  },
};

export const DRIVE_SCOPE_SPECS: readonly DynamicScopeSpec[] = [
  {
    scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    capability: 'drive:browse',
    service: 'drive',
    label: 'Browse & Search Metadata',
    description: 'List Drive filenames, sizes, timestamps, and storage quota without reading file contents.',
    privilegeLevel: 'read',
    minRole: 'observer',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    capability: 'drive:read',
    service: 'drive',
    label: 'Inspect File Contents',
    description: 'Read and preview Drive files, Docs/Sheets exports, and DEM catalogs.',
    privilegeLevel: 'read',
    minRole: 'observer',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.file',
    capability: 'drive:export',
    service: 'drive',
    label: 'Create & Export App Files',
    description: 'Create and update CLPS telemetry, ephemeris JSON, CZML, and field notes owned by this app.',
    privilegeLevel: 'write',
    minRole: 'operator',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive',
    capability: 'drive:manage',
    service: 'drive',
    label: 'Full Drive File Management',
    description: 'Rename, overwrite existing external files, move to Trash, or permanently delete Drive files.',
    privilegeLevel: 'elevated',
    minRole: 'admin',
  },
] as const;

export const GMAIL_SCOPE_SPECS: readonly DynamicScopeSpec[] = [
  {
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    capability: 'gmail:read',
    service: 'gmail',
    label: 'Read Mailbox & Threads',
    description: 'View Gmail profile, labels, message lists, and full message contents.',
    privilegeLevel: 'read',
    minRole: 'observer',
  },
  {
    scope: 'https://www.googleapis.com/auth/gmail.compose',
    capability: 'gmail:compose',
    service: 'gmail',
    label: 'Create & Save Drafts',
    description: 'Compose and save mission briefing drafts into your Gmail Drafts folder.',
    privilegeLevel: 'write',
    minRole: 'operator',
  },
  {
    scope: 'https://www.googleapis.com/auth/gmail.send',
    capability: 'gmail:send',
    service: 'gmail',
    label: 'Send Emails',
    description: 'Send CLPS selenodetic and DTE gate reports via Gmail.',
    privilegeLevel: 'write',
    minRole: 'operator',
  },
  {
    scope: 'https://www.googleapis.com/auth/gmail.modify',
    capability: 'gmail:modify',
    service: 'gmail',
    label: 'Modify Labels & Trash',
    description: 'Mark messages read/unread, archive threads from Inbox, or move messages to Trash.',
    privilegeLevel: 'elevated',
    minRole: 'admin',
  },
  {
    scope: 'https://mail.google.com/',
    capability: 'gmail:delete',
    service: 'gmail',
    label: 'Permanent Mailbox Delete',
    description: 'Permanently delete Gmail messages bypassing Trash.',
    privilegeLevel: 'elevated',
    minRole: 'admin',
  },
] as const;

export const ALL_DYNAMIC_SCOPE_SPECS: readonly DynamicScopeSpec[] = [
  ...DRIVE_SCOPE_SPECS,
  ...GMAIL_SCOPE_SPECS,
];

export const DRIVE_BASE_SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
export const GMAIL_BASE_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

// Least-privilege scope sets (unused broad scopes removed)
export const DRIVE_SCOPES = DRIVE_SCOPE_SPECS.map((s) => s.scope);
export const GMAIL_SCOPES = GMAIL_SCOPE_SPECS.map((s) => s.scope);

export interface ScopeEvaluationDetail {
  scope: string;
  capability: string;
  policyAllowed: boolean;
  roleAllowed: boolean;
  consentGranted: boolean;
  effective: boolean;
  requiredRole: SessionRole | null;
}

export interface TokenEvaluationState {
  grantedScopes: string[];
  rawConsentScopes: string[];
  requestedScopes: string[];
  deniedScopes: string[];
  deniedByPolicy: string[];
  deniedByRole: string[];
  deniedByConsent: string[];
  evaluations: ScopeEvaluationDetail[];
  role: SessionRole;
  evaluatedAt: string;
  expiresAtMs: number | null;
  issuerSource:
    | 'server+oauth2.googleapis.com/tokeninfo'
    | 'oauth2.googleapis.com/tokeninfo'
    | 'firebase-auth-result';
  verifiedEmail?: string;
}

const SCOPE_IMPLICATIONS: Record<string, string[]> = {
  'https://www.googleapis.com/auth/drive': [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
  'https://www.googleapis.com/auth/drive.readonly': [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
  'https://mail.google.com/': [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
  'https://www.googleapis.com/auth/gmail.modify': [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
  'https://www.googleapis.com/auth/gmail.compose': [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ],
};

const firebaseAuth = sharedFirebaseAuth;
export { firebaseAuth };

// OAuth access token & server evaluation metadata are cached strictly in memory (never localStorage/sessionStorage).
let cachedAccessToken: string | null = null;
let cachedEvaluation: TokenEvaluationState | null = null;
let currentSessionRole: SessionRole = 'admin';

type AuthSubscriber = (
  user: User | null,
  accessToken: string | null,
  evaluation: TokenEvaluationState | null
) => void;

const subscribers = new Set<AuthSubscriber>();

function notifySubscribers(): void {
  const currentUser = firebaseAuth.currentUser;
  for (const cb of subscribers) {
    cb(currentUser, cachedAccessToken, cachedEvaluation);
  }
}

export function getScopeSpec(scope: string): DynamicScopeSpec | undefined {
  return ALL_DYNAMIC_SCOPE_SPECS.find((s) => s.scope === scope);
}

export function formatScopeShort(scope: string): string {
  if (scope === 'https://mail.google.com/') return 'mail.google.com';
  return scope.replace('https://www.googleapis.com/auth/', '');
}

export function getSessionRole(): SessionRole {
  return currentSessionRole;
}

export function isRoleSufficientForScope(role: SessionRole, requiredScope: string): boolean {
  const spec = getScopeSpec(requiredScope);
  if (!spec) return false;
  return SESSION_ROLE_INFO[role].rank >= SESSION_ROLE_INFO[spec.minRole].rank;
}

export function isScopeSatisfied(grantedScopes: readonly string[], requiredScope: string): boolean {
  for (const granted of grantedScopes) {
    if (granted === requiredScope) return true;
    const implied = SCOPE_IMPLICATIONS[granted];
    if (implied && implied.includes(requiredScope)) {
      return true;
    }
  }
  return false;
}

export function hasGrantedScope(requiredScope: string): boolean {
  if (!cachedAccessToken || !cachedEvaluation) return false;
  return isScopeSatisfied(cachedEvaluation.grantedScopes, requiredScope);
}

export function getCachedTokenEvaluation(): TokenEvaluationState | null {
  return cachedEvaluation;
}

export function getCachedDriveToken(): string | null {
  return cachedAccessToken;
}

export function clearCachedDriveToken(): void {
  cachedAccessToken = null;
  cachedEvaluation = null;
  notifySubscribers();
}

function createDynamicGoogleProvider(
  scopes: readonly string[],
  options?: { loginHint?: string; forceConsent?: boolean }
): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  const uniqueScopes = Array.from(new Set(scopes.filter(Boolean)));
  for (const scope of uniqueScopes) {
    provider.addScope(scope);
  }

  const customParams: Record<string, string> = {
    include_granted_scopes: 'true',
    prompt: options?.forceConsent ? 'consent' : 'select_account',
  };
  if (options?.loginHint) {
    customParams.login_hint = options.loginHint;
  }
  provider.setCustomParameters(customParams);
  return provider;
}

function buildLocalPolicyEvaluation(
  rawTokenScopes: readonly string[],
  requestedScopes: readonly string[],
  role: SessionRole,
  expiresAtMs: number | null,
  issuerSource: TokenEvaluationState['issuerSource'],
  verifiedEmail?: string
): TokenEvaluationState {
  const grantedScopes = rawTokenScopes.filter((s) => {
    const spec = getScopeSpec(s);
    if (!spec) return false;
    return SESSION_ROLE_INFO[role].rank >= SESSION_ROLE_INFO[spec.minRole].rank;
  });

  const deniedByPolicy: string[] = [];
  const deniedByRole: string[] = [];
  const deniedByConsent: string[] = [];

  const evaluations: ScopeEvaluationDetail[] = requestedScopes.map((scope) => {
    const spec = getScopeSpec(scope);
    const policyAllowed = Boolean(spec);
    const roleAllowed = spec
      ? SESSION_ROLE_INFO[role].rank >= SESSION_ROLE_INFO[spec.minRole].rank
      : false;
    const consentGranted = isScopeSatisfied(rawTokenScopes, scope);

    if (!policyAllowed) deniedByPolicy.push(scope);
    else if (!roleAllowed) deniedByRole.push(scope);
    else if (!consentGranted) deniedByConsent.push(scope);

    return {
      scope,
      capability: spec?.capability || 'unregistered',
      policyAllowed,
      roleAllowed,
      consentGranted,
      effective: policyAllowed && roleAllowed && consentGranted,
      requiredRole: spec?.minRole || null,
    };
  });

  return {
    grantedScopes,
    rawConsentScopes: Array.from(new Set(rawTokenScopes)),
    requestedScopes: Array.from(new Set(requestedScopes)),
    deniedScopes: Array.from(new Set([...deniedByPolicy, ...deniedByRole, ...deniedByConsent])),
    deniedByPolicy,
    deniedByRole,
    deniedByConsent,
    evaluations,
    role,
    evaluatedAt: new Date().toISOString(),
    expiresAtMs,
    issuerSource,
    verifiedEmail,
  };
}

/**
 * Evaluates an issued OAuth access token via our backend `/api/auth/evaluate-scopes`
 * (which introspects `oauth2.googleapis.com/tokeninfo` and evaluates user consent,
 * least-privilege policy allowlists, and session role rules), with direct
 * `oauth2.googleapis.com/tokeninfo` fallback if needed.
 */
export async function evaluateTokenWithAuthServer(
  accessToken: string,
  requestedScopes: readonly string[],
  role: SessionRole = currentSessionRole
): Promise<TokenEvaluationState> {
  // 1. Primary path: Server-side Bearer token introspection + policy & role evaluation
  try {
    const serverRes = await fetch('/api/auth/evaluate-scopes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestedScopes: Array.from(new Set(requestedScopes)),
        role,
      }),
    });

    if (serverRes.ok) {
      const data = (await serverRes.json()) as {
        evaluatedAt: string;
        expiresInSec: number | null;
        verifiedEmail?: string;
        role: SessionRole;
        rawConsentScopes: string[];
        grantedScopes: string[];
        deniedScopes: string[];
        deniedByPolicy: string[];
        deniedByRole: string[];
        deniedByConsent: string[];
        evaluations: ScopeEvaluationDetail[];
      };

      const expiresAtMs =
        typeof data.expiresInSec === 'number' && data.expiresInSec > 0
          ? Date.now() + data.expiresInSec * 1000
          : null;

      return {
        grantedScopes: data.grantedScopes || [],
        rawConsentScopes: data.rawConsentScopes || [],
        requestedScopes: Array.from(new Set(requestedScopes)),
        deniedScopes: data.deniedScopes || [],
        deniedByPolicy: data.deniedByPolicy || [],
        deniedByRole: data.deniedByRole || [],
        deniedByConsent: data.deniedByConsent || [],
        evaluations: data.evaluations || [],
        role: data.role || role,
        evaluatedAt: data.evaluatedAt || new Date().toISOString(),
        expiresAtMs,
        issuerSource: 'server+oauth2.googleapis.com/tokeninfo',
        verifiedEmail: data.verifiedEmail || undefined,
      };
    }
  } catch {
    // Fall back to direct tokeninfo introspection below
  }

  // 2. Fallback path: Direct client-side OAuth2 tokeninfo introspection + local policy/role check
  try {
    let res = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ access_token: accessToken }),
    });

    if (res.status === 405) {
      res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
      );
    }

    if (res.ok) {
      const info = (await res.json()) as {
        scope?: string;
        expires_in?: string | number;
        email?: string;
      };
      const serverScopes = (info.scope || '')
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const expiresSec = Number(info.expires_in);
      const expiresAtMs =
        Number.isFinite(expiresSec) && expiresSec > 0 ? Date.now() + expiresSec * 1000 : null;

      return buildLocalPolicyEvaluation(
        serverScopes,
        requestedScopes,
        role,
        expiresAtMs,
        'oauth2.googleapis.com/tokeninfo',
        info.email
      );
    }
  } catch {
    // Fall through to credential fallback
  }

  const fallbackScopes = Array.from(
    new Set([...(cachedEvaluation?.rawConsentScopes || []), ...requestedScopes])
  );
  return buildLocalPolicyEvaluation(
    fallbackScopes,
    requestedScopes,
    role,
    Date.now() + 3600 * 1000,
    'firebase-auth-result',
    firebaseAuth.currentUser?.email || undefined
  );
}

export async function setSessionRole(role: SessionRole): Promise<TokenEvaluationState | null> {
  currentSessionRole = role;
  if (!cachedAccessToken) {
    notifySubscribers();
    return null;
  }
  const requested = cachedEvaluation?.requestedScopes || [];
  const updatedEval = await evaluateTokenWithAuthServer(cachedAccessToken, requested, role);
  cachedEvaluation = updatedEval;
  notifySubscribers();
  return updatedEval;
}

export function subscribeDriveAuth(onUserChange: AuthSubscriber): () => void {
  subscribers.add(onUserChange);

  const unsubFirebase = onAuthStateChanged(firebaseAuth, (user) => {
    if (!user) {
      cachedAccessToken = null;
      cachedEvaluation = null;
      onUserChange(null, null, null);
    } else {
      onUserChange(user, cachedAccessToken, cachedEvaluation);
    }
  });

  return () => {
    subscribers.delete(onUserChange);
    unsubFirebase();
  };
}

/**
 * Initiates a least-privilege Google sign-in requesting only the specified initial scopes,
 * or incrementally requests dynamic scopes at runtime using OAuth 2.0 `include_granted_scopes=true`.
 */
export async function requestDynamicScopes(
  scopes: readonly string[],
  options?: { forceConsent?: boolean; role?: SessionRole }
): Promise<{
  user: User;
  accessToken: string;
  evaluation: TokenEvaluationState;
}> {
  if (options?.role) {
    currentSessionRole = options.role;
  }

  const currentUserEmail = firebaseAuth.currentUser?.email || undefined;
  const previouslyConsented = cachedEvaluation?.rawConsentScopes || [];
  const combinedRequest = Array.from(new Set([...previouslyConsented, ...scopes]));

  const provider = createDynamicGoogleProvider(combinedRequest, {
    loginHint: currentUserEmail,
    forceConsent: options?.forceConsent ?? true,
  });

  const result = await signInWithPopup(firebaseAuth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (!token) {
    throw new Error(
      'Google OAuth did not return an access token. Please approve the requested permission and retry.'
    );
  }

  const evaluation = await evaluateTokenWithAuthServer(token, scopes, currentSessionRole);
  cachedAccessToken = token;
  cachedEvaluation = evaluation;
  notifySubscribers();

  return {
    user: result.user,
    accessToken: token,
    evaluation,
  };
}

export async function signInWithGoogleDrive(
  initialScopes: readonly string[] = [DRIVE_BASE_SCOPE]
): Promise<{
  user: User;
  accessToken: string;
  evaluation: TokenEvaluationState;
}> {
  return requestDynamicScopes(initialScopes, { forceConsent: true });
}

export async function signOutGoogleDrive(): Promise<void> {
  cachedAccessToken = null;
  cachedEvaluation = null;
  await signOut(firebaseAuth);
  notifySubscribers();
}
