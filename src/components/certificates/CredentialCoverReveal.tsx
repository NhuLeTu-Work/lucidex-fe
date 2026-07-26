import { useEffect, useState } from 'react';

interface CredentialCoverRevealProps {
  logoUrl: string;
  title: string;
  subtitle?: string; // Thêm trường optional info
}

export function CredentialCoverReveal({ logoUrl, title, subtitle = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" }: CredentialCoverRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Delay 300ms tạo cảm giác chờ, sau đó trigger trượt sang trái
    const timer1 = setTimeout(() => setIsOpen(true), 300);
    
    // Thời gian transition là 1.5s. Unmount component sau 2000ms
    const timer2 = setTimeout(() => setIsHidden(true), 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {/* Tấm bìa nguyên khối */}
      <div 
        className="w-full h-full relative"
        style={{
          backgroundColor: '#B22222', // Đỏ đậm giống hình ảnh bìa
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
          transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          // Hiệu ứng trượt toàn bộ bìa sang trái
          transform: isOpen ? 'translateX(-100%)' : 'translateX(0)',
          opacity: isOpen ? 0.2 : 1, // Hơi mờ đi một chút khi trượt xong
        }}
      >
        {/* Nội dung nằm ở nửa bên phải của bìa */}
        <div className="absolute right-0 top-0 w-1/2 h-full flex flex-col items-center justify-between py-12 px-8 text-center sm:py-16">
          
          {subtitle && (
            <h3 className="font-serif font-bold text-[#FFD700] whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-lg tracking-[0.15em] drop-shadow-sm">
              {subtitle}
            </h3>
          )}

          {/* Logo / Quốc huy */}
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-md" 
            />
          )}

          <h1 className="font-serif font-bold text-[#FFD700] whitespace-nowrap text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.1em] drop-shadow-sm">
            {title}
          </h1>
          
        </div>
      </div>
    </div>
  );
}