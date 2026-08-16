import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CredentialViewerProps {
  cover: React.ReactNode;
  content: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

export function CredentialViewer({ cover, content, onClose, actions }: CredentialViewerProps) {
  // Khoá cuộn trang khi đang mở overlay
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        title="Nhấn ra ngoài để đóng"
      />
      
      {/* Nút X đóng ở góc trên bên phải */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[80] p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-xl cursor-pointer"
        title="Đóng"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* 
        Container quy định tỷ lệ và kích thước cho cả cover và content.
        Dùng max-h-[85vh] để không bao giờ bị tràn che mất nút X đóng góc phải. 
      */}
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center select-none"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Layer Content (Nằm dưới, sẽ từ từ lộ ra khi cover lật đi) */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
          {content}
        </div>

        {/* Layer Cover (Nằm trên, có logic tự ẩn sau animation) */}
        {cover}
      </div>

      {actions}
    </div>
  );
}