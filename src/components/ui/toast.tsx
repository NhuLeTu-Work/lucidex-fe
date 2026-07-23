import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning';
  message?: string; // Tùy chọn: Nhận vào một Key từ điển
  onClose: () => void;
  position?: 'top-right' | 'bottom-right';
  autoDismiss?: boolean;
  duration?: number;
  children?: React.ReactNode;
  t: (key: string) => string; // Bắt buộc truyền hàm t từ component cha
}

export function Toast({
  isOpen,
  type,
  message,
  onClose,
  position = 'top-right',
  autoDismiss = true,
  duration = 3000,
  children,
  t,
}: ToastProps) {
  // Tự động đóng Toast sau X giây
  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, duration, onClose]);

  if (!isOpen) return null;

  // Xử lý nội dung hiển thị: 
  // Ưu tiên dịch cái `message` cha truyền vào. 
  // Nếu cha không truyền `message`, dùng câu mặc định theo `type`.
  const defaultMessages = {
    success: t('toastDefaultSuccess') || 'Thao tác thành công.',
    error: t('toastDefaultError') || 'Có lỗi xảy ra, vui lòng thử lại.',
    warning: t('toastDefaultWarning') || 'Có cảnh báo cần chú ý.',
  };

  const displayMessage = message ? (t(message) || message) : defaultMessages[type];

  // Cấu hình style và icon theo từng state
  const config = {
    success: {
      icon: <CheckCircle size={20} className="text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800/30',
      text: 'text-green-800 dark:text-green-300',
    },
    error: {
      icon: <XCircle size={20} className="text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800/30',
      text: 'text-red-800 dark:text-red-300',
    },
    warning: {
      icon: <AlertTriangle size={20} className="text-yellow-500" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800/30',
      text: 'text-yellow-800 dark:text-yellow-300',
    },
  };

  const currentConfig = config[type];

  const positionClasses = position === 'top-right' 
    ? 'top-6 right-6 slide-in-from-top-4 slide-in-from-right-4' 
    : 'bottom-6 right-6 slide-in-from-bottom-4 slide-in-from-right-4';

  return (
    <div className={`fixed z-[200] flex flex-col min-w-[300px] max-w-md shadow-lg rounded-xl border p-4 animate-in fade-in duration-300 ${positionClasses} ${currentConfig.bg} ${currentConfig.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 mt-0.5">
          <div className="shrink-0">{currentConfig.icon}</div>
          <p className={`text-sm font-medium leading-relaxed ${currentConfig.text}`}>
            {displayMessage}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`shrink-0 p-1 rounded-md transition-colors opacity-70 hover:opacity-100 ${currentConfig.text} hover:bg-black/5 dark:hover:bg-white/5`}
        >
          <X size={16} />
        </button>
      </div>
      {children && (
        <div className="mt-3 ml-8">
          {children}
        </div>
      )}
    </div>
  );
}