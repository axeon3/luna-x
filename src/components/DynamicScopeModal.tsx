import { AlertCircle, Shield } from 'lucide-react';
import {
  SESSION_ROLE_INFO,
  formatScopeShort,
  getScopeSpec,
  isRoleSufficientForScope,
  type SessionRole,
} from '../services/googleDriveAuth';

export interface PendingScopeRequest {
  scope: string;
  actionLabel: string;
  onAuthorized: (freshToken: string) => void | Promise<void>;
}

interface DynamicScopeModalProps {
  request: PendingScopeRequest | null;
  currentRole: SessionRole;
  busy: boolean;
  errorText: string | null;
  onCancel: () => void;
  onAuthorize: (elevatedRole?: SessionRole) => void;
  simpleMode?: boolean;
}

export function DynamicScopeModal({
  request,
  currentRole,
  busy,
  errorText,
  onCancel,
  onAuthorize,
  simpleMode = true,
}: DynamicScopeModalProps) {
  if (!request) return null;

  const spec = getScopeSpec(request.scope);
  const roleAllowed = isRoleSufficientForScope(currentRole, request.scope);
  const requiredRole = spec?.minRole || 'admin';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dynamic-scope-title"
    >
      <div className="w-full max-w-md bg-[#0B0F18] border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 id="dynamic-scope-title" className="text-sm font-semibold text-slate-100">
              {simpleMode ? 'Permission Needed' : 'Dynamic Runtime Scope Request'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <span className="font-medium text-slate-100">{request.actionLabel}</span>{' '}
              {simpleMode
                ? 'needs an extra Google permission that is not turned on yet.'
                : 'requires runtime permission not currently active in your session token.'}
            </p>
          </div>
        </div>

        <div className="bg-[#070A10] border border-slate-800 rounded p-2.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-100">
              {spec?.label || formatScopeShort(request.scope)}
            </span>
            {spec && !simpleMode && (
              <span className="font-mono text-[11px] text-cyan-300">{spec.capability}</span>
            )}
          </div>
          {spec?.description && (
            <p className="text-[11px] text-slate-400 leading-relaxed">{spec.description}</p>
          )}
          <div className="pt-1 border-t border-slate-800/80 text-[11px] font-mono text-amber-300 break-all">
            {request.scope}
          </div>
        </div>

        {/* Evaluation Gates: Consent, Policy, Role */}
        <div className="bg-[#070A10] border border-slate-800 rounded p-2.5 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              {simpleMode ? 'App Safety List' : 'Scope Policy Allowlist'}
            </span>
            <span className="font-mono text-emerald-400">
              {spec ? 'APPROVED' : 'DENIED'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              {simpleMode
                ? `Current Role (${SESSION_ROLE_INFO[currentRole].label})`
                : `Session Role (${SESSION_ROLE_INFO[currentRole].label})`}
            </span>
            <span className={`font-mono ${roleAllowed ? 'text-emerald-400' : 'text-amber-300'}`}>
              {roleAllowed
                ? 'ALLOWED'
                : `REQUIRES ${SESSION_ROLE_INFO[requiredRole].label.toUpperCase()}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              {simpleMode ? 'Google Check' : 'Authorization Server'}
            </span>
            <span className="font-mono text-cyan-300">
              {simpleMode ? 'Consent + Token Check' : 'Consent + Token Introspection'}
            </span>
          </div>
        </div>

        {!roleAllowed && (
          <div className="p-2.5 rounded border border-amber-800/70 bg-amber-950/30 text-xs text-amber-200 leading-relaxed">
            {simpleMode ? 'Your access level is currently ' : 'Your active session role is set to '}
            <span className="font-semibold">{SESSION_ROLE_INFO[currentRole].label}</span>. Upgrade
            to <span className="font-semibold">{SESSION_ROLE_INFO[requiredRole].label}</span> and
            approve the permission in Google&apos;s popup to continue.
          </div>
        )}

        {errorText && (
          <div className="p-2.5 rounded border border-rose-900/60 bg-rose-950/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onAuthorize(roleAllowed ? undefined : requiredRole)}
            disabled={busy}
            className="px-3 py-1.5 text-xs font-medium bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
          >
            {busy
              ? 'Checking Consent...'
              : roleAllowed
              ? simpleMode
                ? 'Allow & Continue'
                : 'Authorize & Continue'
              : `Switch to ${SESSION_ROLE_INFO[requiredRole].label} & Allow`}
          </button>
        </div>
      </div>
    </div>
  );
}
