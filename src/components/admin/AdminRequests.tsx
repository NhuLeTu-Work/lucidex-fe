import { ChevronRight } from 'lucide-react';
import type { Account, RequestSubTab } from '../../types/admin';

export function AdminRequests({ pendingIssuers, pendingOrgs, reqSubTab, setReqSubTab, onSelectReq, t }: any) {
  const currentList = reqSubTab === 'issuer' ? pendingIssuers : pendingOrgs;

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-2 text-[var(--ct-text)]">{t('pendingRequests') || 'Pending Requests'}</h1>
      <p className="text-sm mb-6 opacity-70 text-[var(--ct-text)]">{t('pendingRequestsDesc') || 'Process registration requests in a fair, predictable order.'}</p>

      <div className="flex border-b mb-6 border-[var(--ct-border)]">
        <button onClick={() => setReqSubTab('issuer' as RequestSubTab)} className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${reqSubTab === 'issuer' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
          {t('tabIssuer') || 'Issuer'} ({pendingIssuers.length})
        </button>
        <button onClick={() => setReqSubTab('verifier' as RequestSubTab)} className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${reqSubTab === 'verifier' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
          {t('tabOrg') || 'Organization'} ({pendingOrgs.length})
        </button>
      </div>

      <div className="space-y-3">
        {currentList.length === 0 ? (
          <p className="text-sm opacity-60 italic text-[var(--ct-text)]">{t('noPendingReq') || 'No pending requests.'}</p>
        ) : (
          currentList.map((req: Account) => (
            <div key={req.id} onClick={() => onSelectReq(req)} className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] border-[var(--ct-border)] bg-[var(--ct-surface)]">
              <div>
                <h3 className="font-semibold text-sm mb-1 text-[var(--ct-text)]">{req.registrationData?.orgName}</h3>
                <p className="text-xs opacity-60 font-mono text-[var(--ct-text)]">{t('submittedAt') || 'Submitted'}: {new Date(req.registrationData!.submittedAt).toLocaleString()}</p>
              </div>
              <ChevronRight size={16} className="opacity-40 text-[var(--ct-text)]" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}