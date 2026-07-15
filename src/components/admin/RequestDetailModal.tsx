import { X, CheckCircle, XCircle, FileSignature } from 'lucide-react';
import type { Account } from '../../types/admin';

export function RequestDetailModal({ selectedReq, onClose, onApprove, onRejectClick, onViewDoc, t }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6 bg-[var(--ct-surface)] border-[var(--ct-border)]">
        
        <div className="flex items-start justify-between border-b pb-4 border-[var(--ct-border)]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-2 inline-block">
              {selectedReq.type === 'issuer' ? 'Issuer Application' : 'Verifier Application'}
            </span>
            <h2 className="font-display text-2xl font-semibold text-[var(--ct-text)]">{selectedReq.registrationData.orgName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-50 hover:opacity-100 text-[var(--ct-text)]"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label={selectedReq.type === 'issuer' ? (t('lblInstName')||'Institution Name') : (t('lblOrgName')||'Company Name')} value={selectedReq.registrationData.orgName} />
          <DetailItem label={selectedReq.type === 'issuer' ? (t('lblTaxCode')||'Tax Code') : (t('lblMSDN')||'10-digit MSDN')} value={selectedReq.registrationData.taxCode} />
          <DetailItem label={t('lblAddress')||'Registered Address'} value={selectedReq.registrationData.address} fullWidth />
          <DetailItem label={t('lblLegalRep')||'Legal Representative'} value={selectedReq.registrationData.legalRep} />
          <DetailItem label={t('lblContactPhone')||'Contact Phone'} value={selectedReq.registrationData.contactPhone} />
          <DetailItem label={t('lblContactGmail')||'Contact Gmail'} value={selectedReq.email} />
          <DetailItem label={t('lblRegName')||'Registrant Name'} value={selectedReq.registrationData.regName} />
          {selectedReq.type === 'verifier' && (
            <DetailItem label={t('lblRegTitle')||'Registrant Title'} value={selectedReq.registrationData.regTitle} />
          )}
        </div>

        <div className="mt-2">
          <h4 className="text-sm font-semibold mb-3 text-[var(--ct-text)]">{t('attachedDocs') || 'Attached Documents'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={onViewDoc} className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-black/5 dark:hover:bg-white/5 border-[var(--ct-border)]">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><FileSignature size={18} /></div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate text-[var(--ct-text)]">business_registration.pdf</p>
                <p className="text-xs opacity-50 text-[var(--ct-text)]">2.4 MB</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-2 border-[var(--ct-border)]">
          <button onClick={onApprove} className="flex-1 py-3 text-sm font-semibold text-white rounded-xl bg-black shadow-md transition-all hover:opacity-80 active:scale-[0.99] flex items-center justify-center gap-2">
            <CheckCircle size={16} /> {t('approve') || 'Approve'}
          </button>
          <button onClick={onRejectClick} className="flex-1 py-3 text-sm font-semibold text-red-600 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
            <XCircle size={16} /> {t('reject') || 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-3 rounded-lg bg-black/5 dark:bg-white/5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-[var(--ct-text)]">{label}</span>
      <span className="text-sm font-medium text-[var(--ct-text)]">{value || '-'}</span>
    </div>
  );
}