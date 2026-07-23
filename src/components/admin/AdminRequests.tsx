import { ChevronRight, Loader2 } from 'lucide-react';
import type { RequestSubTab } from '../../types/admin';
// Import type thật từ API thay vì Account cũ
import type { OrganizationRecord } from '@/api/types/admin.types'; 

export function AdminRequests({ 
  pendingIssuers, 
  pendingOrgs, 
  isLoading,
  reqSubTab, 
  setReqSubTab, 
  onSelectReq, 
  t 
}: any) {
  const safeIssuers = pendingIssuers || [];
  const safeOrgs = pendingOrgs || [];
  const currentList = reqSubTab === 'issuer' ? safeIssuers : safeOrgs;

  // Chỉ coi là "loading lần đầu" khi đang loading VÀ chưa có data gì cả
  const isInitialLoading = isLoading && currentList.length === 0;

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-2 text-[var(--ct-text)]">{t('pendingRequests') || 'Pending Requests'}</h1>
      <p className="text-sm mb-6 opacity-70 text-[var(--ct-text)]">{t('pendingRequestsDesc') || 'Process registration requests in a fair, predictable order.'}</p>

      <div className="flex border-b mb-6 border-[var(--ct-border)]">
        <button 
          onClick={() => setReqSubTab('issuer' as RequestSubTab)} 
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${reqSubTab === 'issuer' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'}`}
        >
          {t('tabIssuer') || 'Issuer'} ({safeIssuers.length})
        </button>
        <button 
          onClick={() => setReqSubTab('verifier' as RequestSubTab)} 
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${reqSubTab === 'verifier' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'}`}
        >
          {t('tabOrg') || 'Organization'} ({safeOrgs.length})
        </button>
      </div>

      <div className="space-y-3 relative">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50 text-[var(--ct-text)]">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">{t('loadingRequests') || 'Loading requests...'}</span>
          </div>
        ) : currentList.length === 0 ? (
          <p className="text-sm opacity-60 italic text-[var(--ct-text)]">{t('noPendingReq') || 'No pending requests.'}</p>
        ) : (
          <>
            {currentList.map((req: OrganizationRecord) => (
              <div 
                key={req.id} 
                onClick={() => onSelectReq(req)} 
                className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] border-[var(--ct-border)] bg-[var(--ct-surface)]"
              >
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-[var(--ct-text)]">{req.name}</h3>
                  <p className="text-xs opacity-60 font-mono text-[var(--ct-text)]">
                    {t('submittedAt') || 'Submitted'}: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                <ChevronRight size={16} className="opacity-40 text-[var(--ct-text)]" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}