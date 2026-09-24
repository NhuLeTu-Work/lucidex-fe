import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning';
  message?: string;
  onClose: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-center';
  autoDismiss?: boolean;
  duration?: number;
  children?: React.ReactNode;
  t: (key: string) => string;
}

export function Toast({
  isOpen,
  type,
  message,
  onClose,
  position = 'top-right',
  autoDismiss = true,
  duration = 3500,
  children,
  t,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    if (autoDismiss) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          onClose();
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isOpen, autoDismiss, duration, onClose]);

  if (!isOpen) return null;

  const defaultTitles = {
    success: t('toastTitleSuccess') || t('statusSuccess') || 'Thành công',
    error: t('toastTitleError') || t('statusFailed') || 'Lỗi',
    warning: t('toastTitleWarning') || 'Cảnh báo',
  };

  const defaultMessages = {
    success: t('toastDefaultSuccess') || 'Thao tác thành công.',
    error: t('toastDefaultError') || 'Có lỗi xảy ra, vui lòng thử lại.',
    warning: t('toastDefaultWarning') || 'Có cảnh báo cần chú ý.',
  };

  const resolvedMsg = message ? (t(message) || message) : defaultMessages[type];
  const displayMessage = typeof resolvedMsg === 'string'
    ? (t(resolvedMsg.replace(/^\[.*?\]\s*/, '')) || resolvedMsg.replace(/^\[.*?\]\s*/, ''))
    : resolvedMsg;

  const config = {
    success: {
      title: defaultTitles.success,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      bg: 'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
      titleColor: 'text-zinc-900 dark:text-zinc-100',
      bodyColor: 'text-zinc-600 dark:text-zinc-400',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      glow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.25)]',
    },
    error: {
      title: defaultTitles.error,
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      bg: 'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl',
      border: 'border-rose-500/20 dark:border-rose-500/30',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40',
      titleColor: 'text-zinc-900 dark:text-zinc-100',
      bodyColor: 'text-zinc-600 dark:text-zinc-400',
      progressBar: 'bg-gradient-to-r from-rose-500 to-red-400',
      glow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.25)]',
    },
    warning: {
      title: defaultTitles.warning,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      bg: 'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
      titleColor: 'text-zinc-900 dark:text-zinc-100',
      bodyColor: 'text-zinc-600 dark:text-zinc-400',
      progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      glow: 'shadow-[0_10px_30px_-10px_rgba(245,158,11,0.25)]',
    },
  };

  const currentConfig = config[type];

  const positionClasses = position === 'top-right' 
    ? 'top-6 right-6 slide-in-from-top-4 slide-in-from-right-4' 
    : position === 'top-center'
    ? 'top-6 left-1/2 -translate-x-1/2 slide-in-from-top-4'
    : 'bottom-6 right-6 slide-in-from-bottom-4 slide-in-from-right-4';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed z-[9999] flex flex-col min-w-[320px] max-w-md rounded-2xl border overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${positionClasses} ${currentConfig.bg} ${currentConfig.border} ${currentConfig.glow}`}
    >
      <div className="p-4 flex items-start gap-3.5">
        <div className={`p-2 rounded-xl shrink-0 ${currentConfig.badgeBg}`}>
          {currentConfig.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className={`text-sm font-semibold tracking-tight ${currentConfig.titleColor}`}>
            {currentConfig.title}
          </h4>
          <p className={`text-xs mt-0.5 leading-relaxed break-words font-medium ${currentConfig.bodyColor}`}>
            {displayMessage}
          </p>
          {children && <div className="mt-2.5">{children}</div>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={t('close') || 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {autoDismiss && (
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${currentConfig.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}