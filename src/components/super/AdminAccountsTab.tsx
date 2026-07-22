import { Key, RotateCcw, Lock, Unlock, Trash2, Plus, Loader2 } from 'lucide-react';
import type { UIAdminAccount } from '../../types/superAdmin'; // Đảm bảo type này khớp với UIAdminAccount

interface Props {
  // 2. Gán đúng type cho accounts
  accounts: UIAdminAccount[]; 
  
  // 3. Khai báo chặt chẽ các action type giống hệt như trong ConfirmModalState
  openConfirm: (title: string, msg: string, type: 'resetTotp' | 'resetPassword' | 'lock' | 'delete', id: string) => void;
  
  onOpenCreate: () => void;
  t: (key: string) => string;
  isCreating?: boolean; 
}
export function AdminAccountsTab({ accounts, openConfirm, onOpenCreate, t, isCreating }: Props) {
  return (
    <div className="animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--ct-text)]">{t('adminAccountsTitle')}</h1>
        
        {/* Cập nhật nút bấm có loading */}
        <button 
          onClick={onOpenCreate} 
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
          {t('provisionNewAdmin')}
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
        <table className="w-full text-sm text-left">
          {/* ... (Phần thead và tbody giữ nguyên y hệt code cũ của bạn) ... */}
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
            <tr>
              <th className="px-4 py-3 font-semibold">{t('username')}</th>
              <th className="px-4 py-3 font-semibold">{t('role')}</th>
              <th className="px-4 py-3 font-semibold">{t('totpStatus')}</th>
              <th className="px-4 py-3 font-semibold text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id} className={`border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${acc.locked ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                <td className="px-4 py-4 font-mono font-bold">{acc.username}</td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${acc.role === 'Super Admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {acc.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold ${acc.totpEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                    {acc.totpEnabled ? t('enabled') : t('setupRequired')}
                  </span>
                </td>
                <td className="px-4 py-4 flex items-center justify-end gap-2">
                  <button onClick={() => openConfirm(t('resetPassword'), `${t('resetPassword')} ${acc.username}?`, 'resetPassword', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={t('resetPassword')}>
                    <Key size={16} />
                  </button>
                  <button onClick={() => openConfirm(t('resetTotpKey'), `${t('resetTotpKey')} ${acc.username}?`, 'resetTotp', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={t('resetTotpKey')}>
                    <RotateCcw size={16} />
                  </button>
                  {acc.role !== 'Super Admin' && (
                    <>
                      <button onClick={() => openConfirm(acc.locked ? t('unlockAccount') : t('lockAccount'), `${acc.locked ? t('unlockAccount') : t('lockAccount')} ${acc.username}?`, 'lock', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={acc.locked ? t('unlockAccount') : t('lockAccount')}>
                        {acc.locked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={() => openConfirm(t('deleteAccount'), `${t('deleteAccount')} ${acc.username}?`, 'delete', acc.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500" title={t('deleteAccount')}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}