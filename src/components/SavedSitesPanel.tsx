import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { BookmarkPlus, LogIn, LogOut, MapPin, Trash2 } from 'lucide-react';
import { BasemapMode, CLPSMission } from '../data/clpsMissions';
import {
  SITE_CONSTRAINTS,
  SavedLunarSite,
  deleteLunarSite,
  saveLunarSite,
  signInWithFirebaseGoogle,
  signOutFirebase,
  updateLunarSite,
} from '../firebase';
import type { CustomCoordsValue } from './BottomDock';

interface SavedSitesPanelProps {
  user: User | null;
  authReady: boolean;
  savedSites: SavedLunarSite[];
  syncError: string | null;
  selectedMission: CLPSMission;
  dateTimeUtc: string;
  basemapMode: BasemapMode;
  onLoadSavedSite: (site: SavedLunarSite) => void;
  onSaveCoords?: (coords: CustomCoordsValue) => void;
  simpleMode?: boolean;
}

export function SavedSitesPanel({
  user,
  authReady,
  savedSites,
  syncError,
  selectedMission,
  dateTimeUtc,
  basemapMode,
  onLoadSavedSite,
  simpleMode = true,
}: SavedSitesPanelProps) {
  const [name, setName] = useState<string>(selectedMission.name);
  const [notes, setNotes] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) {
      setName(selectedMission.name.slice(0, SITE_CONSTRAINTS.NAME_MAX_LEN));
    }
  }, [selectedMission.id, selectedMission.name, editingId]);

  const formatFriendlyError = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { error?: string };
      if (parsed?.error) message = parsed.error;
    } catch {
      // Plain error message
    }
    if (message.includes('Quota exceeded')) {
      return 'Daily Firestore free-tier quota exceeded. Quota resets tomorrow.';
    }
    if (message.includes('popup-closed-by-user')) {
      return 'Sign-in popup was closed before completing.';
    }
    if (message.includes('api-key-not-valid')) {
      return 'Firebase Auth API key is invalid or restricted (auth/api-key-not-valid). Please verify the Web API key for this Firebase project in Google Cloud Console / firebase-applet-config.json.';
    }
    if (message.includes('the client is offline')) {
      return 'Cloud Firestore is offline or unreachable (often caused by an invalid/restricted Firebase API key or network block).';
    }
    return message;
  };

  const handleSignIn = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await signInWithFirebaseGoogle();
    } catch (err) {
      setLocalError(formatFriendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await signOutFirebase();
      setEditingId(null);
      setNotes('');
    } catch (err) {
      setLocalError(formatFriendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setLocalError(null);
    setStatusMsg(null);
    try {
      const payload = {
        name: name.trim().slice(0, SITE_CONSTRAINTS.NAME_MAX_LEN) || 'Saved Lunar Site',
        latDeg: selectedMission.latDeg,
        lonDeg: selectedMission.lonDeg,
        elevationM: selectedMission.elevationM,
        dateTimeUtc,
        basemapMode,
        notes: notes.trim().slice(0, SITE_CONSTRAINTS.NOTES_MAX_LEN),
      };
      if (editingId) {
        await updateLunarSite(user.uid, editingId, payload);
        setStatusMsg('Updated saved site in Firestore.');
        setEditingId(null);
      } else {
        await saveLunarSite(user.uid, payload);
        setStatusMsg('Saved spot & UTC epoch to Firestore.');
      }
      setNotes('');
    } catch (err) {
      setLocalError(formatFriendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!user) return;
    setBusy(true);
    setLocalError(null);
    try {
      await deleteLunarSite(user.uid, siteId);
      if (editingId === siteId) setEditingId(null);
    } catch (err) {
      setLocalError(formatFriendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {simpleMode ? 'Saved Lunar Spots (Cloud Sync)' : 'Firebase Saved Sites & Snapshots'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {simpleMode
              ? 'Save custom coordinates, dates, and notes to your account so they stay synced across sessions.'
              : 'Persists selenodetic waypoints, UTC epochs, and basemap presets in Cloud Firestore.'}
          </p>
        </div>
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign out</span>
          </button>
        )}
      </div>

      {!authReady ? (
        <div className="p-3 bg-[#070A10] border border-slate-800 rounded text-xs text-slate-400">
          Checking Firebase session...
        </div>
      ) : !user ? (
        <div className="p-4 bg-[#070A10] border border-slate-800 rounded-lg space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {simpleMode
              ? 'Sign in with Google to save your favorite Moon locations, custom coordinates, and UTC lighting snapshots to the cloud.'
              : 'Authenticate with Google via Firebase Auth to sync private selenodetic waypoints in Firestore.'}
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={busy}
            className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      ) : (
        <>
          <div className="p-2.5 bg-[#070A10] border border-slate-800 rounded text-[11px] font-mono flex items-center justify-between gap-2">
            <span className="text-slate-400 truncate">
              {user.displayName || 'Signed in'} · <span className="text-cyan-300">{user.email}</span>
            </span>
            {syncError ? (
              <span className="text-rose-400 shrink-0">● Offline</span>
            ) : (
              <span className="text-emerald-400 shrink-0">● Synced</span>
            )}
          </div>

          <form
            onSubmit={handleSaveCurrent}
            className="p-3 bg-[#070A10] border border-slate-800 rounded-lg space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                {editingId
                  ? 'Update Saved Spot'
                  : simpleMode
                    ? 'Save Current Spot & Date'
                    : 'Save Current Target & Epoch'}
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                {selectedMission.latDeg.toFixed(4)}°, {selectedMission.lonDeg.toFixed(4)}°
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>UTC: {dateTimeUtc.replace('T', ' ')}</span>
              <span>Map: {basemapMode.toUpperCase()}</span>
            </div>

            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
              <span>Site Name (max {SITE_CONSTRAINTS.NAME_MAX_LEN} chars)</span>
              <input
                type="text"
                required
                maxLength={SITE_CONSTRAINTS.NAME_MAX_LEN}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shackleton Crater Observation"
                className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
              <span>Notes (optional, max {SITE_CONSTRAINTS.NOTES_MAX_LEN} chars)</span>
              <textarea
                rows={2}
                maxLength={SITE_CONSTRAINTS.NOTES_MAX_LEN}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lighting notes, terrain observations, or thermal goals..."
                className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none resize-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{editingId ? 'Save Changes' : 'Save to Cloud'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName(selectedMission.name);
                    setNotes('');
                  }}
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {statusMsg && (
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/60 rounded text-xs text-emerald-300">
              {statusMsg}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Your Saved Spots ({savedSites.length})
              </span>
              <span className="text-[11px] font-mono">Click to fly &amp; restore</span>
            </div>

            {savedSites.length === 0 ? (
              <div className="p-3 bg-[#070A10] border border-slate-800 rounded text-xs text-slate-400">
                No saved lunar spots yet. Pick any mission or custom coordinates above and click Save to Cloud.
              </div>
            ) : (
              <div className="space-y-2">
                {savedSites.map((site) => (
                  <div
                    key={site.id}
                    className="p-3 bg-[#070A10] border border-slate-800 hover:border-cyan-500/50 rounded-lg space-y-1.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadSavedSite(site)}
                        className="text-left flex-1 cursor-pointer group"
                      >
                        <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{site.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                          {site.latDeg.toFixed(4)}°, {site.lonDeg.toFixed(4)}° · {site.elevationM} m
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          UTC {site.dateTimeUtc.replace('T', ' ')} · {site.basemapMode.toUpperCase()}
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(site.id);
                            setName(site.name);
                            setNotes(site.notes);
                            onLoadSavedSite(site);
                          }}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(site.id)}
                          disabled={busy}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                          aria-label={`Delete ${site.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {site.notes && (
                      <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-1.5">
                        {site.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {(localError || syncError) && (
        <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded text-xs text-rose-300">
          {formatFriendlyError(localError || syncError)}
        </div>
      )}
    </div>
  );
}
