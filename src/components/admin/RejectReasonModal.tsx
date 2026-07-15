export function RejectReasonModal({ reason, setReason, onSubmit, onClose, t }: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4 bg-[var(--ct-surface)] border-[var(--ct-border)]">
        <h3 className="font-display text-xl font-semibold text-[var(--ct-text)]">{t('rejectReasonTitle') || 'Reason for Rejection'}</h3>
        <p className="text-sm opacity-70 text-[var(--ct-text)]">
          {t('rejectReasonDesc') || 'Please provide a reason for rejecting this application.'}
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('enterReason') || 'e.g. The uploaded document is blurred...'}
            rows={4}
            required
            className="w-full p-3 text-sm rounded-xl border outline-none focus:border-red-400 resize-none bg-[var(--ct-bg)] border-[var(--ct-border)] text-[var(--ct-text)]"
            onInvalid={(e) => (e.target as HTMLTextAreaElement).setCustomValidity(t('reqReasonErr') || 'A reason is required.')}
            onInput={(e) => (e.target as HTMLTextAreaElement).setCustomValidity('')}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-xl transition-all opacity-70 hover:opacity-100 text-[var(--ct-text)]">
              {t('cancel') || 'Cancel'}
            </button>
            <button type="submit" disabled={!reason.trim()} className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-red-600 shadow-md transition-all hover:opacity-90 disabled:opacity-50">
              {t('confirmReject') || 'Confirm Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}