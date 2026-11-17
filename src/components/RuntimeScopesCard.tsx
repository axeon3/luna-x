import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import {
  SESSION_ROLE_INFO,
  formatScopeShort,
  isRoleSufficientForScope,
  isScopeSatisfied,
  type DynamicScopeSpec,
  type SessionRole,
  type TokenEvaluationState,
} from '../services/googleDriveAuth';

interface RuntimeScopesCardProps {
  specs: readonly DynamicScopeSpec[];
  evaluation: TokenEvaluationState | null;
  currentRole: SessionRole;
  onChangeRole: (role: SessionRole) => void;
  busyScope: string | null;
  onRequestScopes: (scopes: string[]) => void;
  simpleMode?: boolean;
}

const ROLE_SIMPLE_LABELS: Record<SessionRole, { label: string; desc: string }> = {
  observer: {
    label: 'Read Only',
    desc: 'Can view file names, read files, and read emails. Cannot create, send, or delete.',
  },
  operator: {
    label: 'Creator',
    desc: 'Can read plus export new reports, save notes/drafts, and send emails.',
  },
  admin: {
    label: 'Full Access',
    desc: 'Allows every action including renaming, archiving, trashing, and deleting.',
  },
};

export function RuntimeScopesCard({
  specs,
  evaluation,
  currentRole,
  onChangeRole,
  busyScope,
  onRequestScopes,
  simpleMode = true,
}: RuntimeScopesCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string[]>([]);

  const grantedList = evaluation?.grantedScopes || [];
  const rawConsentList = evaluation?.rawConsentScopes || [];
  const deniedList = evaluation?.deniedScopes || [];
  const grantedCount = specs.filter((s) => isScopeSatisfied(grantedList, s.scope)).length;

  const ttlMinutes =
    evaluation?.expiresAtMs && evaluation.expiresAtMs > Date.now()
      ? Math.max(1, Math.round((evaluation.expiresAtMs - Date.now()) / 60000))
      : null;

  const toggleBatchScope = (scope: string) => {
    setSelectedBatch((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="pt-1.5 border-t border-slate-800/80">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 text-[11px] text-slate-300 hover:text-white cursor-pointer py-0.5"
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{simpleMode ? 'App Permissions' : 'Dynamic Scopes'}</span>
          <span className="font-mono text-cyan-300">
            {grantedCount}/{specs.length} {simpleMode ? 'on' : 'active'}
          </span>
          <span className="font-mono text-slate-400">
            · {simpleMode ? ROLE_SIMPLE_LABELS[currentRole].label : SESSION_ROLE_INFO[currentRole].label}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2.5">
          {/* Role Selector & Server Introspection Provenance */}
          <div className="p-2 bg-[#0B0F18] border border-slate-800/90 rounded space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
              <span>
                {simpleMode ? 'Verified by: ' : 'Eval: '}
                <span className="text-slate-200">
                  {simpleMode
                    ? evaluation?.issuerSource
                      ? 'Google Auth Server'
                      : 'waiting'
                    : evaluation?.issuerSource || 'pending'}
                </span>
              </span>
              {ttlMinutes !== null && (
                <span>{simpleMode ? `Expires in ~${ttlMinutes}m` : `TTL ~${ttlMinutes}m`}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-400">
                {simpleMode ? 'Your Access Level (Role Limit)' : 'Active Session Role Policy'}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['observer', 'operator', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChangeRole(r)}
                    disabled={busyScope !== null}
                    className={`px-1.5 py-1 text-[10px] font-medium rounded border cursor-pointer disabled:opacity-50 ${
                      currentRole === r
                        ? 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {simpleMode ? ROLE_SIMPLE_LABELS[r].label : SESSION_ROLE_INFO[r].label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 leading-snug">
                {simpleMode
                  ? ROLE_SIMPLE_LABELS[currentRole].desc
                  : SESSION_ROLE_INFO[currentRole].description}
              </div>
            </div>
          </div>

          {/* Individual Scope Status & Batch Request */}
          <div className="space-y-1.5">
            {specs.map((spec) => {
              const effectiveGranted = isScopeSatisfied(grantedList, spec.scope);
              const consentedButRoleCapped =
                !effectiveGranted && isScopeSatisfied(rawConsentList, spec.scope);
              const roleAllowed = isRoleSufficientForScope(currentRole, spec.scope);
              const denied = !effectiveGranted && deniedList.includes(spec.scope);
              const isBusy = busyScope === spec.scope;
              const checked = selectedBatch.includes(spec.scope);

              return (
                <div
                  key={spec.scope}
                  className="p-2 bg-[#0B0F18] border border-slate-800/90 rounded text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-1.5">
                      {!effectiveGranted && roleAllowed && (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBatchScope(spec.scope)}
                          aria-label={`Select ${spec.capability} scope`}
                          className="accent-cyan-400 cursor-pointer shrink-0"
                        />
                      )}
                      <span className="font-medium text-slate-200 truncate">{spec.label}</span>
                      {!simpleMode && (
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {spec.capability}
                        </span>
                      )}
                    </div>

                    {effectiveGranted ? (
                      <span className="font-mono text-[10px] text-emerald-400 shrink-0">
                        {simpleMode ? 'ALLOWED' : 'GRANTED'}
                      </span>
                    ) : !roleAllowed ? (
                      <span className="font-mono text-[10px] text-amber-400 shrink-0">
                        {simpleMode
                          ? `NEEDS: ${ROLE_SIMPLE_LABELS[spec.minRole].label.toUpperCase()}`
                          : `ROLE: ${SESSION_ROLE_INFO[spec.minRole].label.toUpperCase()}`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequestScopes([spec.scope])}
                        disabled={busyScope !== null}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-cyan-300 hover:bg-slate-700 hover:text-cyan-200 rounded cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {isBusy
                          ? 'Asking...'
                          : denied
                          ? simpleMode
                            ? 'Ask Again'
                            : 'Retry Grant'
                          : simpleMode
                          ? 'Turn On'
                          : 'Request'}
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    {simpleMode ? spec.description : formatScopeShort(spec.scope)}
                  </div>

                  {consentedButRoleCapped && (
                    <div className="text-[10px] text-amber-300">
                      {simpleMode
                        ? `Google approved this, but your current "${ROLE_SIMPLE_LABELS[currentRole].label}" level blocks it.`
                        : `Consented in token, restricted by ${SESSION_ROLE_INFO[currentRole].label} role policy.`}
                    </div>
                  )}
                  {!consentedButRoleCapped && denied && (
                    <div className="text-[10px] text-rose-300">
                      {simpleMode
                        ? 'Permission was not turned on in the Google sign-in prompt.'
                        : 'Withheld by user consent or authorization server policy.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedBatch.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const batch = [...selectedBatch];
                setSelectedBatch([]);
                onRequestScopes(batch);
              }}
              disabled={busyScope !== null}
              className="w-full py-1.5 text-[11px] font-medium bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
            >
              {busyScope
                ? 'Checking with Google...'
                : simpleMode
                ? `Turn On ${selectedBatch.length} Selected Permission${
                    selectedBatch.length > 1 ? 's' : ''
                  }`
                : `Request ${selectedBatch.length} Selected Dynamic Scope${
                    selectedBatch.length > 1 ? 's' : ''
                  }`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
