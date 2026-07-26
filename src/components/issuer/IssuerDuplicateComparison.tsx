import { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface DuplicateRecord {
  studentId: string;
  existing: any;
  incoming: any;
}

interface IssuerDuplicateComparisonProps {
  isOpen: boolean;
  t: (k: string) => string;
  duplicates: DuplicateRecord[];
  onComplete: () => void;
}

export function IssuerDuplicateComparison({
  isOpen,
  t,
  duplicates,
  onComplete,
}: IssuerDuplicateComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleResolve = (_overwrite: boolean) => {
    // Luồng thực tế sẽ gọi API hoặc lưu state ở đây
    
    if (currentIndex < duplicates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Khi đã duyệt hết, hiển thị trạng thái loading trong 5 giây
      setIsCompleting(true);
      setTimeout(() => {
        setIsCompleting(false);
        setCurrentIndex(0); // reset state
        onComplete();
      }, 5000);
    }
  };

  if (!isOpen || duplicates.length === 0) return null;

  const currentRecord = duplicates[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl">
        {isCompleting ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold">{t('processingDuplicates')}</h3>
            <p className="text-sm text-muted-foreground">{t('pleaseWait')}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="text-amber-500" />
                {t('duplicateDetected')}
              </DialogTitle>
              <DialogDescription>
                {t('duplicateDesc')} (ID: <span className="font-bold text-foreground">{currentRecord.studentId}</span>)
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Bản ghi hiện tại trên hệ thống */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground">{t('existingRecord')}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t('fullName')}:</span> {currentRecord.existing?.fullName}</p>
                  <p><span className="text-muted-foreground">{t('dob')}:</span> {currentRecord.existing?.dob}</p>
                  <p><span className="text-muted-foreground">{t('major')}:</span> {currentRecord.existing?.major}</p>
                  <p><span className="text-muted-foreground">{t('gradYear')}:</span> {currentRecord.existing?.gradYear}</p>
                </div>
              </div>

              {/* Bản ghi mới tải lên */}
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 relative">
                <ArrowRight className="absolute -left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <h4 className="font-semibold text-sm mb-3 text-primary">{t('incomingRecord')}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t('fullName')}:</span> {currentRecord.incoming?.fullName}</p>
                  <p><span className="text-muted-foreground">{t('dob')}:</span> {currentRecord.incoming?.dob}</p>
                  <p><span className="text-muted-foreground">{t('major')}:</span> {currentRecord.incoming?.major}</p>
                  <p><span className="text-muted-foreground">{t('gradYear')}:</span> {currentRecord.incoming?.gradYear}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {duplicates.length} {t('duplicatesRemaining')}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleResolve(false)}>
                  {t('doNotOverwrite')}
                </Button>
                <Button onClick={() => handleResolve(true)}>
                  {t('overwrite')}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}