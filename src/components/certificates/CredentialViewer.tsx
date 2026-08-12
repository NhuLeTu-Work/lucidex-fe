import React, { useEffect } from 'react';

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
      


      {/* 
        Container quy định tỷ lệ và kích thước cho cả cover và content.
        Vì GraduationCertificate có 2 trang nên dùng khung ngang. 
      */}
      <div 
        className="relative w-full max-w-6xl shadow-2xl rounded-sm overflow-hidden flex items-center justify-center select-none"
        style={{ aspectRatio: '16/9' }} // Hoặc '2/1' tuỳ vào thiết kế CSS của GraduationCertificate
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