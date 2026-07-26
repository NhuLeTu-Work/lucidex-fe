import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface IssuerScanModalProps {
  isOpen: boolean;
  t: (k: string) => string;
  onComplete: () => void;
}

export function IssuerScanModal({ isOpen, t, onComplete }: IssuerScanModalProps) {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // SỬA Ở ĐÂY: Dùng number hoặc ReturnType<typeof setInterval> thay vì NodeJS.Timeout
    let interval: ReturnType<typeof setInterval>;
    
    if (isOpen) {
      setScanProgress(0); // Reset progress mỗi khi mở modal
      
      // 10 giây = 100 bước, mỗi bước 100ms
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete(); // Báo cho component cha biết khi quét xong
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, onComplete]);

  // Nếu không open thì không render nội dung thừa
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('scanningFile')}</DialogTitle>
          <DialogDescription>{t('scanningFileDesc')}</DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <Progress value={scanProgress} className="h-2 w-full" />
          <p className="text-sm text-center text-muted-foreground">{scanProgress}%</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}