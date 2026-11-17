import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertTriangle,
  Archive,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  Paperclip,
  RefreshCw,
  Reply,
  Search,
  Send,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import type { CLPSMission } from '../data/clpsMissions';
import {
  IAU2015_MOON,
  computeLanderQuaternion,
  computeSolarZenithDeg,
  selenographicToMCMF,
} from '../engine/selenodesy';
import type { SampledEntityState } from '../workers/czmlWorker';
import {
  GMAIL_BASE_SCOPE,
  GMAIL_SCOPE_SPECS,
  SESSION_ROLE_INFO,
  clearCachedDriveToken,
  formatScopeShort,
  getCachedDriveToken,
  getCachedTokenEvaluation,
  getSessionRole,
  isRoleSufficientForScope,
  isScopeSatisfied,
  requestDynamicScopes,
  setSessionRole,
  signOutGoogleDrive,
  subscribeDriveAuth,
  type SessionRole,
  type TokenEvaluationState,
} from '../services/googleDriveAuth';
import {
  GmailAuthExpiredError,
  GmailInsufficientScopeError,
  createGmailDraft,
  deleteGmailMessagePermanently,
  fetchGmailProfile,
  getGmailMessageFull,
  listGmailMessages,
  modifyGmailMessageLabels,
  sendGmailMessage,
  trashGmailMessage,
  type GmailMessageFull,
  type GmailMessageSummary,
  type GmailProfile,
} from '../services/gmailApi';
import { DynamicScopeModal, type PendingScopeRequest } from './DynamicScopeModal';
import { RuntimeScopesCard } from './RuntimeScopesCard';

const SCOPE_GMAIL_COMPOSE = 'https://www.googleapis.com/auth/gmail.compose';
const SCOPE_GMAIL_SEND = 'https://www.googleapis.com/auth/gmail.send';
const SCOPE_GMAIL_MODIFY = 'https://www.googleapis.com/auth/gmail.modify';
const SCOPE_GMAIL_FULL = 'https://mail.google.com/';

interface GmailPanelProps {
  selectedMission: CLPSMission;
  solarLonDeg: number;
  czmlStates: SampledEntityState[];
  simpleMode?: boolean;
}

type MailboxView = 'INBOX' | 'UNREAD' | 'SENT' | 'DRAFTS' | 'ALL';

type PendingGmailAction =
  | {
      kind: 'send';
      to: string;
      subject: string;
      body: string;
    }
  | {
      kind: 'archive';
      message: GmailMessageSummary;
    }
  | {
      kind: 'trash';
      message: GmailMessageSummary;
    }
  | {
      kind: 'delete';
      message: GmailMessageSummary;
    };

function formatDateCompact(dateStr: string, internalDate?: string): string {
  if (internalDate) {
    const ms = Number(internalDate);
    if (Number.isFinite(ms)) {
      return new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    }
  }
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }
  return dateStr.slice(0, 22);
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function GmailPanel({
  selectedMission,
  solarLonDeg,
  czmlStates,
  simpleMode = true,
}: GmailPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedDriveToken());
  const [evaluation, setEvaluation] = useState<TokenEvaluationState | null>(() =>
    getCachedTokenEvaluation()
  );
  const [currentRole, setCurrentRole] = useState<SessionRole>(() => getSessionRole());
  const [selectedInitialScopes, setSelectedInitialScopes] = useState<string[]>([GMAIL_BASE_SCOPE]);
  const [authLoading, setAuthLoading] = useState(false);

  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [mailboxView, setMailboxView] = useState<MailboxView>('INBOX');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [selectedMessage, setSelectedMessage] = useState<GmailMessageFull | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const [showComposer, setShowComposer] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [prefillBusy, setPrefillBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingGmailAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const [pendingScope, setPendingScope] = useState<PendingScopeRequest | null>(null);
  const [scopeBusy, setScopeBusy] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);
  const [cardScopeBusy, setCardScopeBusy] = useState<string | null>(null);

  const [statusNotice, setStatusNotice] = useState<{
    type: 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeDriveAuth((nextUser, nextToken, nextEval) => {
      setUser(nextUser);
      setAccessToken(nextToken);
      setEvaluation(nextEval);
      setCurrentRole(nextEval?.role || getSessionRole());
      if (!nextToken) {
        setProfile(null);
        setMessages([]);
        setSelectedMessage(null);
      }
    });
    return unsub;
  }, []);

  const hasScope = useCallback(
    (requiredScope: string) => {
      if (!accessToken || !evaluation) return false;
      return isScopeSatisfied(evaluation.grantedScopes, requiredScope);
    },
    [accessToken, evaluation]
  );

  const hasReadScope = hasScope(GMAIL_BASE_SCOPE);

  const handleAuthError = useCallback(
    (err: unknown, retryCallback?: (freshToken: string) => void | Promise<void>) => {
      if (err instanceof GmailAuthExpiredError) {
        clearCachedDriveToken();
        setAccessToken(null);
        setEvaluation(null);
        setStatusNotice({
          type: 'error',
          text: err.message,
        });
        return;
      }
      if (err instanceof GmailInsufficientScopeError && err.requiredScope) {
        setScopeError(null);
        setPendingScope({
          scope: err.requiredScope,
          actionLabel: 'Complete Gmail Operation',
          onAuthorized: retryCallback || (() => {}),
        });
        return;
      }
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gmail request failed.',
      });
    },
    []
  );

  const loadMailbox = useCallback(
    async (
      token: string,
      view = mailboxView,
      searchQuery = activeSearch,
      pageToken?: string
    ) => {
      setLoadingMessages(true);
      try {
        const labelIds: string[] = [];
        const query = searchQuery.trim();
        if (view === 'INBOX') labelIds.push('INBOX');
        else if (view === 'SENT') labelIds.push('SENT');
        else if (view === 'DRAFTS') labelIds.push('DRAFT');
        else if (view === 'UNREAD') {
          labelIds.push('UNREAD');
        }

        const [profileRes, listRes] = await Promise.all([
          pageToken || profile ? Promise.resolve(profile) : fetchGmailProfile(token),
          listGmailMessages(token, {
            q: query,
            labelIds,
            maxResults: 15,
            pageToken,
          }),
        ]);
        if (profileRes) setProfile(profileRes);
        setMessages((prev) =>
          pageToken ? [...prev, ...listRes.messages] : listRes.messages
        );
        setNextPageToken(listRes.nextPageToken);
      } catch (err) {
        handleAuthError(err, (freshToken) =>
          loadMailbox(freshToken, view, searchQuery, pageToken)
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [activeSearch, handleAuthError, mailboxView, profile]
  );

  useEffect(() => {
    if (accessToken && hasReadScope) {
      loadMailbox(accessToken, mailboxView, activeSearch);
    }
  }, [accessToken, hasReadScope, mailboxView, activeSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async () => {
    setAuthLoading(true);
    setStatusNotice(null);
    try {
      const { user: signedInUser, accessToken: token, evaluation: evalRes } =
        await requestDynamicScopes(selectedInitialScopes, {
          forceConsent: true,
          role: currentRole,
        });
      setUser(signedInUser);
      setAccessToken(token);
      setEvaluation(evalRes);
      setCurrentRole(evalRes.role);
      if (evalRes.deniedScopes.length > 0) {
        setStatusNotice({
          type: 'error',
          text: `Authorization server withheld ${evalRes.deniedScopes
            .map(formatScopeShort)
            .join(', ')} (${evalRes.issuerSource}).`,
        });
      } else {
        setStatusNotice({
          type: 'info',
          text:
            selectedInitialScopes.length > 0
              ? `Connected Gmail (${selectedInitialScopes
                  .map(formatScopeShort)
                  .join(', ')}) as ${
                  signedInUser.email || signedInUser.displayName || 'Google account'
                }.`
              : `Signed in with identity-only session as ${
                  signedInUser.email || signedInUser.displayName || 'Google account'
                }. Request Gmail scopes dynamically below.`,
        });
      }
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Google sign-in failed.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGrantBaseReadScope = async () => {
    setAuthLoading(true);
    setStatusNotice(null);
    try {
      const { accessToken: token, evaluation: evalRes } = await requestDynamicScopes([
        GMAIL_BASE_SCOPE,
      ]);
      setAccessToken(token);
      setEvaluation(evalRes);
      if (isScopeSatisfied(evalRes.grantedScopes, GMAIL_BASE_SCOPE)) {
        setStatusNotice({
          type: 'info',
          text: `Runtime scope ${formatScopeShort(GMAIL_BASE_SCOPE)} granted by authorization server.`,
        });
      } else {
        setStatusNotice({
          type: 'error',
          text: `Authorization server denied ${formatScopeShort(GMAIL_BASE_SCOPE)}.`,
        });
      }
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to request Gmail read scope.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setStatusNotice(null);
    try {
      await signOutGoogleDrive();
      setUser(null);
      setAccessToken(null);
      setEvaluation(null);
      setProfile(null);
      setMessages([]);
      setSelectedMessage(null);
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Sign out failed.',
      });
    }
  };

  const runWithScope = (
    requiredScope: string,
    actionLabel: string,
    fn: (token: string) => void | Promise<void>
  ) => {
    if (!accessToken) return;
    if (hasScope(requiredScope)) {
      void fn(accessToken);
      return;
    }
    setScopeError(null);
    setPendingScope({
      scope: requiredScope,
      actionLabel,
      onAuthorized: fn,
    });
  };

  const handleAuthorizePendingScope = async (elevatedRole?: SessionRole) => {
    if (!pendingScope) return;
    setScopeBusy(true);
    setScopeError(null);
    try {
      const { accessToken: freshToken, evaluation: evalRes } = await requestDynamicScopes(
        [pendingScope.scope],
        { role: elevatedRole }
      );
      setAccessToken(freshToken);
      setEvaluation(evalRes);
      setCurrentRole(evalRes.role);
      if (!isScopeSatisfied(evalRes.grantedScopes, pendingScope.scope)) {
        const roleBlocked = evalRes.deniedByRole.includes(pendingScope.scope);
        const policyBlocked = evalRes.deniedByPolicy.includes(pendingScope.scope);
        setScopeError(
          policyBlocked
            ? `Scope ${formatScopeShort(pendingScope.scope)} is blocked by the server policy allowlist.`
            : roleBlocked
            ? `Active session role (${SESSION_ROLE_INFO[evalRes.role].label}) is insufficient for ${formatScopeShort(
                pendingScope.scope
              )}.`
            : `Authorization server evaluated the request and did not grant ${formatScopeShort(
                pendingScope.scope
              )}. Ensure you approved the permission prompt.`
        );
        return;
      }
      const continuation = pendingScope.onAuthorized;
      setPendingScope(null);
      await continuation(freshToken);
    } catch (err) {
      setScopeError(err instanceof Error ? err.message : 'Dynamic scope authorization failed.');
    } finally {
      setScopeBusy(false);
    }
  };

  const handleChangeRole = async (nextRole: SessionRole) => {
    setCurrentRole(nextRole);
    setCardScopeBusy('role');
    setStatusNotice(null);
    try {
      const updatedEval = await setSessionRole(nextRole);
      if (updatedEval) {
        setEvaluation(updatedEval);
        const cappedSpecs = GMAIL_SCOPE_SPECS.filter(
          (s) =>
            isScopeSatisfied(updatedEval.rawConsentScopes, s.scope) &&
            !isScopeSatisfied(updatedEval.grantedScopes, s.scope)
        );
        setStatusNotice({
          type: 'info',
          text: `Session role policy set to ${SESSION_ROLE_INFO[nextRole].label}.${
            cappedSpecs.length > 0
              ? ` ${cappedSpecs.map((s) => s.capability).join(', ')} restricted by role ceiling.`
              : ` Verified via ${updatedEval.issuerSource}.`
          }`,
        });
      }
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update session role policy.',
      });
    } finally {
      setCardScopeBusy(null);
    }
  };

  const handleRequestScopesFromCard = async (scopes: string[]) => {
    if (scopes.length === 0) return;
    setCardScopeBusy(scopes[0]);
    setStatusNotice(null);
    try {
      const { accessToken: freshToken, evaluation: evalRes } = await requestDynamicScopes(scopes, {
        role: currentRole,
      });
      setAccessToken(freshToken);
      setEvaluation(evalRes);
      setCurrentRole(evalRes.role);
      const granted = scopes.filter((s) => isScopeSatisfied(evalRes.grantedScopes, s));
      const missing = scopes.filter((s) => !isScopeSatisfied(evalRes.grantedScopes, s));
      if (missing.length === 0) {
        setStatusNotice({
          type: 'info',
          text: `Dynamic scope${granted.length > 1 ? 's' : ''} ${granted
            .map(formatScopeShort)
            .join(', ')} granted and verified via ${evalRes.issuerSource}.`,
        });
      } else {
        setStatusNotice({
          type: 'error',
          text: `Withheld ${missing.map(formatScopeShort).join(', ')} (${
            evalRes.deniedByRole.length > 0
              ? 'restricted by role policy'
              : 'not granted in user consent / policy'
          }).`,
        });
      }
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Scope request failed.',
      });
    } finally {
      setCardScopeBusy(null);
    }
  };

  const handleOpenMessage = async (summary: GmailMessageSummary) => {
    if (!accessToken) return;
    setLoadingFull(true);
    setStatusNotice(null);
    try {
      const full = await getGmailMessageFull(accessToken, summary.id);
      setSelectedMessage(full);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoadingFull(false);
    }
  };

  const executeToggleUnread = async (token: string, msg: GmailMessageSummary) => {
    setStatusNotice(null);
    try {
      await modifyGmailMessageLabels(token, msg.id, {
        addLabelIds: msg.isUnread ? [] : ['UNREAD'],
        removeLabelIds: msg.isUnread ? ['UNREAD'] : [],
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isUnread: !msg.isUnread } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, isUnread: !prev.isUnread } : null
        );
      }
    } catch (err) {
      handleAuthError(err, (freshToken) => executeToggleUnread(freshToken, msg));
    }
  };

  const handlePrefillMissionSummary = () => {
    const mcmf = selenographicToMCMF(
      selectedMission.lonDeg,
      selectedMission.latDeg,
      selectedMission.elevationM
    );
    const q = computeLanderQuaternion(
      selectedMission.lonDeg,
      selectedMission.latDeg,
      selectedMission.attitudeEulerDeg
    );
    const solarZenith = computeSolarZenithDeg(
      selectedMission.lonDeg,
      selectedMission.latDeg,
      solarLonDeg
    );
    const activeState = czmlStates.find((s) => s.id === selectedMission.id);

    setShowComposer(true);
    if (!composeTo && profile?.emailAddress) {
      setComposeTo(profile.emailAddress);
    }
    setComposeSubject(
      `[CLPS Telemetry] ${selectedMission.taskOrder} — ${selectedMission.name} (${selectedMission.destination})`
    );
    setComposeBody(
      [
        `NASA CLPS Lunar Browser — Site Engineering Report`,
        `Mission: ${selectedMission.name} (${selectedMission.taskOrder})`,
        `Contractor / Lander: ${selectedMission.contractor} / ${selectedMission.landerClass}`,
        `Destination: ${selectedMission.destination} (${selectedMission.hemisphere})`,
        `Status: ${selectedMission.statusLabel}`,
        ``,
        `Selenodetic Vector (IAU2015_Moon, R_M = ${(IAU2015_MOON.MEAN_RADIUS_M / 1000).toFixed(1)} km):`,
        `- Lat / Lon / Elev: ${selectedMission.latDeg.toFixed(3)} deg, ${selectedMission.lonDeg.toFixed(3)} deg, ${selectedMission.elevationM} m`,
        `- Solar Zenith Angle: ${solarZenith.toFixed(2)} deg (Subsolar Lon ${solarLonDeg} deg)`,
        `- MCMF Cartesian (km): (${(mcmf.x / 1000).toFixed(2)}, ${(mcmf.y / 1000).toFixed(2)}, ${(mcmf.z / 1000).toFixed(2)})`,
        `- Attitude Quaternion: [${q.x.toFixed(4)}, ${q.y.toFixed(4)}, ${q.z.toFixed(4)}, ${q.w.toFixed(4)}]`,
        activeState
          ? `- Sampled CZML Track Radius: ${(Math.hypot(activeState.x, activeState.y, activeState.z) / 1000).toFixed(2)} km`
          : null,
        ``,
        `Manifested Payloads (${selectedMission.payloads.length}):`,
        ...selectedMission.payloads.map((p) => `- ${p}`),
      ]
        .filter((line): line is string => line !== null)
        .join('\n')
    );
  };

  const handlePrefillEphemerisReport = async () => {
    setPrefillBusy(true);
    setStatusNotice(null);
    try {
      const res = await fetch(
        `/api/ephemeris/libration?lat=${selectedMission.latDeg}&lon=${selectedMission.lonDeg}&elevM=${selectedMission.elevationM}&hours=720`
      );
      if (!res.ok) throw new Error(`Ephemeris endpoint returned HTTP ${res.status}`);
      const data = await res.json();
      setShowComposer(true);
      if (!composeTo && profile?.emailAddress) {
        setComposeTo(profile.emailAddress);
      }
      setComposeSubject(
        `[CLPS Ephemeris & DTE Gate] ${selectedMission.taskOrder} — ${selectedMission.name}`
      );
      setComposeBody(
        [
          `NASA CLPS Ephemeris & DTE Visibility Report (rfc-2026-clps-v1.0)`,
          `Site: ${selectedMission.name} (${selectedMission.taskOrder}) · ${selectedMission.destination}`,
          `Coordinates: ${selectedMission.latDeg.toFixed(3)} deg, ${selectedMission.lonDeg.toFixed(3)} deg (Elev ${selectedMission.elevationM} m)`,
          `Source: ${data.source || 'NASA/JPL Horizons DE441'}`,
          ``,
          `Hardware Protection Gates:`,
          `- Solar Duty Cycle (>= 70.0%): ${data.solar_illumination?.duty_cycle_pct?.toFixed?.(1) ?? '—'}% (${data.solar_illumination?.pass ? 'PASS' : 'FAIL'})`,
          `- DTE Visibility (>= 55.0%): ${data.dte_comms?.visibility_pct?.toFixed?.(1) ?? '—'}% (${data.dte_comms?.pass ? 'PASS' : 'FAIL'})`,
          `- Window Samples: ${data.window_hours ?? 720} hours`,
        ].join('\n')
      );
    } catch (err) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch ephemeris telemetry.',
      });
    } finally {
      setPrefillBusy(false);
    }
  };

  const executeSaveDraft = async (token: string) => {
    setDraftBusy(true);
    setStatusNotice(null);
    try {
      await createGmailDraft(token, {
        to: composeTo.trim(),
        subject: composeSubject.trim() || '(No subject)',
        body: composeBody,
      });
      setStatusNotice({
        type: 'info',
        text: 'Saved draft to your Gmail Drafts folder.',
      });
      if (mailboxView === 'DRAFTS') {
        await loadMailbox(token, 'DRAFTS', activeSearch);
      }
    } catch (err) {
      handleAuthError(err, executeSaveDraft);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleSaveDraftClick = () => {
    if (!composeSubject.trim() && !composeBody.trim()) {
      setStatusNotice({ type: 'error', text: 'Enter a subject or body before saving a draft.' });
      return;
    }
    runWithScope(SCOPE_GMAIL_COMPOSE, 'Save Gmail Draft', executeSaveDraft);
  };

  const handleRequestSend = () => {
    if (!composeTo.trim()) {
      setStatusNotice({ type: 'error', text: 'Recipient email address (To) is required.' });
      return;
    }
    if (!composeSubject.trim()) {
      setStatusNotice({ type: 'error', text: 'Email subject is required before sending.' });
      return;
    }
    const nextSend: PendingGmailAction = {
      kind: 'send',
      to: composeTo.trim(),
      subject: composeSubject.trim(),
      body: composeBody,
    };
    runWithScope(SCOPE_GMAIL_SEND, `Send Email to ${nextSend.to}`, () => {
      setPendingAction(nextSend);
    });
  };

  const handleConfirmPendingAction = async (tokenOverride?: string) => {
    const activeToken = tokenOverride || accessToken;
    if (!activeToken || !pendingAction) return;
    setConfirmBusy(true);
    setStatusNotice(null);
    try {
      if (pendingAction.kind === 'send') {
        await sendGmailMessage(activeToken, {
          to: pendingAction.to,
          subject: pendingAction.subject,
          body: pendingAction.body,
        });
        setShowComposer(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setStatusNotice({
          type: 'info',
          text: `Email sent to ${pendingAction.to}.`,
        });
      } else if (pendingAction.kind === 'archive') {
        await modifyGmailMessageLabels(activeToken, pendingAction.message.id, {
          removeLabelIds: ['INBOX'],
        });
        if (selectedMessage?.id === pendingAction.message.id) {
          setSelectedMessage(null);
        }
        setStatusNotice({
          type: 'info',
          text: `Archived "${pendingAction.message.subject}".`,
        });
      } else if (pendingAction.kind === 'trash') {
        await trashGmailMessage(activeToken, pendingAction.message.id);
        if (selectedMessage?.id === pendingAction.message.id) {
          setSelectedMessage(null);
        }
        setStatusNotice({
          type: 'info',
          text: `Moved "${pendingAction.message.subject}" to Gmail Trash.`,
        });
      } else if (pendingAction.kind === 'delete') {
        await deleteGmailMessagePermanently(activeToken, pendingAction.message.id);
        if (selectedMessage?.id === pendingAction.message.id) {
          setSelectedMessage(null);
        }
        setStatusNotice({
          type: 'info',
          text: `Permanently deleted "${pendingAction.message.subject}".`,
        });
      }
      setPendingAction(null);
      await loadMailbox(activeToken, mailboxView, activeSearch);
    } catch (err) {
      handleAuthError(err, (freshToken) => handleConfirmPendingAction(freshToken));
    } finally {
      setConfirmBusy(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {simpleMode ? 'Gmail Mission Reports' : 'Gmail Mission Dispatch'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {simpleMode
              ? 'Start with read-only access or pick your permissions below. Sending, drafting, archiving, or deleting emails asks for permission only when you use it.'
              : 'Sign in with read-only Gmail permissions first. Draft, send, label modification, and permanent delete scopes are requested dynamically at runtime only when triggered.'}
          </p>
        </div>

        <div className="p-3.5 bg-[#070A10] border border-slate-800 rounded space-y-3">
          {user && (
            <div className="text-xs text-amber-300">
              Session detected for {user.email || user.displayName}. Sign in again to get a fresh
              in-memory access token.
            </div>
          )}

          <div className="space-y-2 pt-0.5">
            <div>
              <div className="text-[11px] font-medium text-slate-300 mb-1">
                {simpleMode ? 'Access Level' : 'Session Role Policy'}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['observer', 'operator', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setCurrentRole(r);
                      void setSessionRole(r);
                      setSelectedInitialScopes((prev) =>
                        prev.filter((s) => isRoleSufficientForScope(r, s))
                      );
                    }}
                    className={`px-1.5 py-1 text-[10px] font-medium rounded border cursor-pointer ${
                      currentRole === r
                        ? 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-[#0B0F18] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {SESSION_ROLE_INFO[r].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-300 mb-1">
                {simpleMode
                  ? 'Permissions to Turn On at Sign-In'
                  : 'Initial Dynamic Scopes Requested at Sign-In'}
              </div>
              <div className="space-y-1">
                {GMAIL_SCOPE_SPECS.map((spec) => {
                  const allowedByRole = isRoleSufficientForScope(currentRole, spec.scope);
                  const checked = selectedInitialScopes.includes(spec.scope);
                  return (
                    <label
                      key={spec.scope}
                      className={`flex items-center justify-between gap-2 px-2 py-1 rounded border text-[11px] ${
                        allowedByRole
                          ? 'border-slate-800 bg-[#0B0F18] text-slate-200 cursor-pointer'
                          : 'border-slate-800/50 bg-[#070A10] text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <input
                          type="checkbox"
                          disabled={!allowedByRole}
                          checked={checked}
                          onChange={() =>
                            setSelectedInitialScopes((prev) =>
                              prev.includes(spec.scope)
                                ? prev.filter((s) => s !== spec.scope)
                                : [...prev, spec.scope]
                            )
                          }
                          className="accent-cyan-400 cursor-pointer shrink-0"
                        />
                        <span className="truncate">{spec.label}</span>
                      </span>
                      <span className="font-mono text-[10px] text-cyan-300 shrink-0">
                        {spec.capability}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={authLoading}
            className="inline-flex items-center justify-center gap-3 h-10 px-4 rounded bg-white text-[#1f1f1f] border border-[#747775] hover:bg-[#f8f9fa] active:bg-[#eeeeee] text-[14px] font-medium tracking-[0.25px] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-[18px] h-[18px] shrink-0"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>{authLoading ? 'Authorizing...' : 'Sign in with Google'}</span>
          </button>

          <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
            <div>
              Selected scopes:{' '}
              <span className="font-mono text-cyan-300">
                {selectedInitialScopes.length > 0
                  ? selectedInitialScopes.map(formatScopeShort).join(', ')
                  : 'identity-only (request capabilities later)'}
              </span>
            </div>
            <div>
              Tokens remain strictly in memory and are evaluated against user consent, policy
              allowlists, and active role rules via Google&apos;s authorization server.
            </div>
          </div>
        </div>

        {statusNotice && (
          <div
            className={`p-3 rounded border text-xs ${
              statusNotice.type === 'error'
                ? 'border-rose-900/60 bg-rose-950/30 text-rose-300'
                : 'border-cyan-900/60 bg-cyan-950/30 text-cyan-200'
            }`}
          >
            {statusNotice.text}
          </div>
        )}
      </div>
    );
  }

  if (!hasReadScope) {
    return (
      <div className="space-y-4">
        <div className="p-3.5 bg-[#070A10] border border-slate-800 rounded space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Dynamic Gmail Scope Required
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Signed in as{' '}
                  <span className="font-mono text-slate-200">
                    {user?.email || user?.displayName || 'Google user'}
                  </span>
                  , but your active token does not yet hold{' '}
                  <span className="font-mono text-cyan-300">
                    {formatScopeShort(GMAIL_BASE_SCOPE)}
                  </span>
                  .
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGrantBaseReadScope}
            disabled={authLoading}
            className="w-full py-2 px-3 text-xs font-medium bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
          >
            {authLoading
              ? 'Evaluating Authorization...'
              : `Request Dynamic Scope (${formatScopeShort(GMAIL_BASE_SCOPE)})`}
          </button>

          <RuntimeScopesCard
            specs={GMAIL_SCOPE_SPECS}
            evaluation={evaluation}
            currentRole={currentRole}
            onChangeRole={handleChangeRole}
            busyScope={cardScopeBusy}
            onRequestScopes={handleRequestScopesFromCard}
            simpleMode={simpleMode}
          />
        </div>

        {statusNotice && (
          <div
            className={`p-3 rounded border text-xs ${
              statusNotice.type === 'error'
                ? 'border-rose-900/60 bg-rose-950/30 text-rose-300'
                : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300'
            }`}
          >
            {statusNotice.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Summary & Dynamic Scope Evaluation */}
      <div className="p-3 bg-[#070A10] border border-slate-800 rounded space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-100 truncate">
              {profile?.emailAddress || user?.email || 'Gmail Account'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {profile
                ? `${profile.messagesTotal.toLocaleString()} msgs · ${profile.threadsTotal.toLocaleString()} threads`
                : 'Loading mailbox profile...'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => loadMailbox(accessToken, mailboxView, activeSearch)}
              disabled={loadingMessages}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded cursor-pointer disabled:opacity-50"
              title="Refresh mailbox"
              aria-label="Refresh mailbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <RuntimeScopesCard
          specs={GMAIL_SCOPE_SPECS}
          evaluation={evaluation}
          currentRole={currentRole}
          onChangeRole={handleChangeRole}
          busyScope={cardScopeBusy}
          onRequestScopes={handleRequestScopesFromCard}
          simpleMode={simpleMode}
        />
      </div>

      {statusNotice && (
        <div
          className={`p-2.5 rounded border text-xs flex items-start justify-between gap-2 ${
            statusNotice.type === 'error'
              ? 'border-rose-900/60 bg-rose-950/30 text-rose-300'
              : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300'
          }`}
        >
          <span>{statusNotice.text}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compose & Active Mission Dispatch Helpers */}
      <div className="p-3 bg-[#070A10] border border-slate-800 rounded space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-100">Mission Telemetry Dispatch</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedMission.taskOrder} · {selectedMission.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposer((s) => !s)}
            className="px-2.5 py-1 text-[11px] font-medium bg-amber-500 text-slate-950 rounded hover:bg-amber-400 cursor-pointer shrink-0"
          >
            {showComposer ? 'Hide Compose' : '+ Compose'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handlePrefillMissionSummary}
            className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-800 text-slate-100 rounded hover:bg-slate-700 cursor-pointer"
          >
            Pre-fill Site Summary
          </button>
          <button
            type="button"
            onClick={handlePrefillEphemerisReport}
            disabled={prefillBusy}
            className="px-2.5 py-1.5 text-[11px] font-medium bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
          >
            {prefillBusy ? 'Loading Ephemeris...' : 'Pre-fill DTE Report'}
          </button>
        </div>

        {showComposer && (
          <div className="pt-2.5 border-t border-slate-800 space-y-2">
            <input
              type="email"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              placeholder="Recipient (To): e.g. mission-ops@example.com"
              className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F18] border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70"
            />
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-2.5 py-1.5 text-xs bg-[#0B0F18] border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70"
            />
            <textarea
              rows={6}
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Write telemetry briefing or mission message..."
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#0B0F18] border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveDraftClick}
                disabled={draftBusy}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                {draftBusy ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={handleRequestSend}
                className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-slate-950 rounded hover:bg-amber-400 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mailbox Search & Label Filter */}
      <div className="space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setActiveSearch(searchInput);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Gmail (e.g. CLPS, from:nasa, is:unread)"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#070A10] border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 rounded hover:bg-slate-700 cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded overflow-x-auto">
            {(
              [
                { id: 'INBOX', label: 'Inbox' },
                { id: 'UNREAD', label: 'Unread' },
                { id: 'SENT', label: 'Sent' },
                { id: 'DRAFTS', label: 'Drafts' },
                { id: 'ALL', label: 'All' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMailboxView(tab.id)}
                className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer ${
                  mailboxView === tab.id
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-slate-400 shrink-0">{messages.length} shown</span>
        </div>
      </div>

      {/* Selected Message Reader */}
      {(loadingFull || selectedMessage) && (
        <div className="border border-cyan-800/70 bg-[#070A10] rounded overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 bg-[#0B0F18]">
            <div className="min-w-0 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-100 truncate">
                {loadingFull ? 'Loading message...' : selectedMessage?.subject}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer shrink-0"
              aria-label="Close message reader"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!loadingFull && selectedMessage && (
            <div className="p-3 space-y-3">
              <div className="text-[11px] font-mono space-y-1 text-slate-400 border-b border-slate-800/80 pb-2">
                <div className="truncate">
                  <span className="text-slate-500">From: </span>
                  <span className="text-slate-200">{selectedMessage.from}</span>
                </div>
                {selectedMessage.to && (
                  <div className="truncate">
                    <span className="text-slate-500">To: </span>
                    <span className="text-slate-300">{selectedMessage.to}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Date: </span>
                  <span>
                    {formatDateCompact(selectedMessage.date, selectedMessage.internalDate)}
                  </span>
                </div>
              </div>

              <div className="max-h-60 overflow-auto text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                {selectedMessage.bodyText}
              </div>

              {selectedMessage.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>Attachments ({selectedMessage.attachments.length})</span>
                  </div>
                  {selectedMessage.attachments.map((att, idx) => (
                    <div
                      key={`${att.filename}-${idx}`}
                      className="text-[11px] font-mono text-cyan-300 flex justify-between gap-2"
                    >
                      <span className="truncate">{att.filename}</span>
                      <span className="text-slate-400 shrink-0">{formatByteSize(att.size)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const replyMatch = selectedMessage.from.match(/<([^>]+)>/);
                    const replyAddr = replyMatch ? replyMatch[1] : selectedMessage.from;
                    setShowComposer(true);
                    setComposeTo(replyAddr);
                    setComposeSubject(
                      selectedMessage.subject.startsWith('Re:')
                        ? selectedMessage.subject
                        : `Re: ${selectedMessage.subject}`
                    );
                    setComposeBody(
                      `\n\n--- On ${formatDateCompact(
                        selectedMessage.date,
                        selectedMessage.internalDate
                      )}, ${selectedMessage.from} wrote ---\n${selectedMessage.bodyText}`
                    );
                  }}
                  className="px-2 py-1 bg-slate-800 text-slate-100 rounded hover:bg-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(
                      SCOPE_GMAIL_MODIFY,
                      selectedMessage.isUnread ? 'Mark Message Read' : 'Mark Message Unread',
                      (token) => executeToggleUnread(token, selectedMessage)
                    )
                  }
                  className="px-2 py-1 bg-slate-800 text-slate-200 rounded hover:bg-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  {selectedMessage.isUnread ? (
                    <MailOpen className="w-3 h-3" />
                  ) : (
                    <Mail className="w-3 h-3" />
                  )}
                  <span>{selectedMessage.isUnread ? 'Mark Read' : 'Mark Unread'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(SCOPE_GMAIL_MODIFY, `Archive "${selectedMessage.subject}"`, () =>
                      setPendingAction({ kind: 'archive', message: selectedMessage })
                    )
                  }
                  className="px-2 py-1 bg-slate-800 text-amber-300 rounded hover:bg-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(
                      SCOPE_GMAIL_MODIFY,
                      `Move "${selectedMessage.subject}" to Trash`,
                      () => setPendingAction({ kind: 'trash', message: selectedMessage })
                    )
                  }
                  className="px-2 py-1 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded hover:bg-rose-900/60 inline-flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Trash</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages List */}
      <div className="border border-slate-800 rounded bg-[#070A10] divide-y divide-slate-800/80">
        {loadingMessages && messages.length === 0 && (
          <div className="p-4 text-xs text-slate-400">Loading Gmail messages...</div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="p-4 text-xs text-slate-400">
            No messages matched this filter or search query.
          </div>
        )}

        {messages.map((msg) => {
          const isSelected = selectedMessage?.id === msg.id;
          return (
            <div
              key={msg.id}
              className={`p-2.5 space-y-1 transition-colors ${
                isSelected ? 'bg-slate-900/90' : 'hover:bg-slate-900/40'
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpenMessage(msg)}
                className="w-full text-left space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs truncate ${
                      msg.isUnread
                        ? 'font-semibold text-slate-100'
                        : 'font-medium text-slate-300'
                    }`}
                  >
                    {msg.subject}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {formatDateCompact(msg.date, msg.internalDate).slice(0, 10)}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-400 truncate">{msg.from}</div>
                {msg.snippet && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {msg.snippet}
                  </p>
                )}
              </button>

              <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(
                      SCOPE_GMAIL_MODIFY,
                      msg.isUnread ? 'Mark Message Read' : 'Mark Message Unread',
                      (token) => executeToggleUnread(token, msg)
                    )
                  }
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {msg.isUnread ? 'Mark read' : 'Mark unread'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(SCOPE_GMAIL_MODIFY, `Archive "${msg.subject}"`, () =>
                      setPendingAction({ kind: 'archive', message: msg })
                    )
                  }
                  className="text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(SCOPE_GMAIL_MODIFY, `Move "${msg.subject}" to Trash`, () =>
                      setPendingAction({ kind: 'trash', message: msg })
                    )
                  }
                  className="text-rose-400 hover:text-rose-300 cursor-pointer ml-auto"
                >
                  Trash
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runWithScope(SCOPE_GMAIL_FULL, `Permanently delete "${msg.subject}"`, () =>
                      setPendingAction({ kind: 'delete', message: msg })
                    )
                  }
                  className="text-rose-500 hover:text-rose-400 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {nextPageToken && (
        <button
          type="button"
          onClick={() => loadMailbox(accessToken, mailboxView, activeSearch, nextPageToken)}
          disabled={loadingMessages}
          className="w-full py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white cursor-pointer disabled:opacity-50"
        >
          {loadingMessages ? 'Loading...' : 'Load More Messages'}
        </button>
      )}

      {/* Dynamic Runtime Scope Elevation Modal */}
      <DynamicScopeModal
        request={pendingScope}
        currentRole={currentRole}
        busy={scopeBusy}
        errorText={scopeError}
        onCancel={() => {
          setPendingScope(null);
          setScopeError(null);
        }}
        onAuthorize={handleAuthorizePendingScope}
        simpleMode={simpleMode}
      />

      {/* Mandatory Explicit Confirmation Modal for Send / Mutating / Destructive Gmail Actions */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gmail-confirm-title"
        >
          <div className="w-full max-w-md bg-[#0B0F18] border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 id="gmail-confirm-title" className="text-sm font-semibold text-slate-100">
                  {pendingAction.kind === 'send' && 'Confirm Send Email via Gmail'}
                  {pendingAction.kind === 'archive' && 'Confirm Archive Message'}
                  {pendingAction.kind === 'trash' && 'Confirm Move Message to Trash'}
                  {pendingAction.kind === 'delete' && 'Confirm Permanent Gmail Deletion'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {pendingAction.kind === 'send' &&
                    `Send this message via your Gmail account to "${pendingAction.to}"?`}
                  {pendingAction.kind === 'archive' &&
                    `Remove the INBOX label and archive "${pendingAction.message.subject}"?`}
                  {pendingAction.kind === 'trash' &&
                    `Move "${pendingAction.message.subject}" from ${pendingAction.message.from} to Gmail Trash?`}
                  {pendingAction.kind === 'delete' &&
                    `Permanently delete "${pendingAction.message.subject}" from ${pendingAction.message.from}? This bypasses Trash and cannot be undone.`}
                </p>
              </div>
            </div>

            {pendingAction.kind === 'send' ? (
              <div className="bg-[#070A10] border border-slate-800 rounded p-2.5 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="truncate">
                  <span className="text-slate-500">To: </span>
                  {pendingAction.to}
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Subject: </span>
                  {pendingAction.subject}
                </div>
                <div className="text-slate-400 line-clamp-3 pt-1 border-t border-slate-800/80 whitespace-pre-wrap">
                  {pendingAction.body || '(Empty body)'}
                </div>
              </div>
            ) : (
              <div className="bg-[#070A10] border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-400 truncate">
                Message ID: {pendingAction.message.id}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={confirmBusy}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPendingAction()}
                disabled={confirmBusy}
                className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer disabled:opacity-50 ${
                  pendingAction.kind === 'delete' || pendingAction.kind === 'trash'
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {confirmBusy
                  ? 'Processing...'
                  : pendingAction.kind === 'send'
                  ? 'Confirm & Send'
                  : pendingAction.kind === 'archive'
                  ? 'Confirm Archive'
                  : pendingAction.kind === 'trash'
                  ? 'Move to Trash'
                  : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
