import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  credentials: { username: string; password: string } | null;
  onClose: () => void;
  t: (key: string) => string; // <=== Thêm prop t
}

export function CreateAdminModal({ credentials, onClose, t }: Props) {
  // credentials lúc này luôn có sẵn vì đã được tạo trước khi mở modal
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl bg-[var(--ct-surface)] border-[var(--ct-border)] animate-in zoom-in-95">
        <h2 className="font-display text-xl font-semibold mb-6 text-[var(--ct-text)]">
          {t('provisionAdminAccount')}
        </h2>

        {/* Luôn hiển thị thông tin, không cần logic {!credentials ? ...} nữa */}
        <div className="space-y-4">
          {/* Box hiển thị Username */}
          <CredentialBox label={t('usernameLabel')} value={credentials?.username || ''} t={t} />
          
          {/* Box hiển thị Password (UI giống hệt phần setup password) */}
          <CredentialBox label={t('tempPasswordLabel')} value={credentials?.password || ''} t={t} isPassword />

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs">
            <CheckCircle size={14} className="shrink-0 mt-0.5" />
            <p>{t('storeCredentialsWarning')}</p>
          </div>
          
          <button onClick={onClose} className="w-full mt-2 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:opacity-80">
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Component nhỏ để hiển thị box thông tin cho gọn
function CredentialBox({ label, value, t, isPassword }: any) {
  return (
    <div className="p-4 rounded-xl border bg-[var(--ct-bg)] border-[var(--ct-border)]">
      <p className="text-xs uppercase font-bold tracking-wider opacity-50 mb-1 text-[var(--ct-text)]">{label}</p>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-lg font-bold text-[var(--ct-text)] ${isPassword ? 'tracking-[0.2em]' : ''}`}>
          {value}
        </span>
        <button onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} ${t('copiedToClipboard')}`); }} className="p-2 hover:bg-black/10 rounded-md text-[var(--ct-text)]">
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}