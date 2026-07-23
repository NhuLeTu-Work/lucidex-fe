import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string; // Tiêu đề tuỳ chọn
  content: React.ReactNode; // Nội dung custom truyền vào
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean; // Hiển thị vòng xoay khi đang xử lý API
  confirmStyle?: 'primary' | 'danger'; // Đổi màu nút xác nhận tuỳ ngữ cảnh
  t: (key: string) => string;
}

export function ConfirmationModal({
  isOpen,
  title,
  content,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmStyle = 'primary',
  t,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop overlay chặn toàn bộ màn hình
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div 
        className="relative w-full max-w-md p-6 mx-4 rounded-2xl shadow-2xl border bg-[var(--ct-surface)] border-[var(--ct-border)] animate-in zoom-in-95 duration-200"
        // Ngăn chặn sự kiện click lan ra ngoài (dù backdrop không có sự kiện đóng)
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col gap-4 text-[var(--ct-text)]">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${confirmStyle === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <AlertTriangle size={24} />
            </div>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
          </div>

          {/* Nội dung custom truyền từ component cha */}
          <div className="mt-2 text-sm opacity-80 leading-relaxed">
            {content}
          </div>

          {/* Dòng text xác nhận cố định */}
          <p className="font-medium text-sm mt-2">
            {t('proceedConfirmation') || 'Bạn có chắc chắn muốn tiếp tục?'}
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[100px] ${
                confirmStyle === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-[var(--ct-text)] text-[var(--ct-bg)] hover:opacity-90'
              }`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {t('confirm') || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}