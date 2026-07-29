import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';

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
  isOpen, t,
  duplicates,
  onComplete,
}: IssuerDuplicateComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Store request: Lưu trữ danh sách các Student ID cần xóa khỏi DB cũ
  const [_deletedRecords, setDeletedRecords] = useState<string[]>([]);

  const handleResolve = (_action: 'overwrite' | 'skip') => {
    if (currentIndex < duplicates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleting(true);
      setTimeout(() => {
        setIsCompleting(false);
        setCurrentIndex(0);
        setDeletedRecords([]); // Clear store sau khi hoàn tất
        onComplete();
      }, 5000);
    }
  };

  if (!isOpen || duplicates.length === 0) return null;

  const currentRecord = duplicates[currentIndex];

  // Khai báo danh sách các trường cần kiểm tra
  const allFields = [
    { key: 'fullName', label: t('fullName') },
    { key: 'dob', label: t('dob') },
    { key: 'major', label: t('major') },
    { key: 'gradYear', label: t('gradYear') },
  ];

  // Lọc ra CHỈ NHỮNG TRƯỜNG CÓ DỮ LIỆU KHÁC NHAU
  const differingFields = allFields.filter(
    (field) => currentRecord.existing?.[field.key] !== currentRecord.incoming?.[field.key]
  );

  // Fallback: Nếu dữ liệu giống nhau 100%, vẫn hiển thị toàn bộ để UI không bị trống
  const displayFields = differingFields.length > 0 ? differingFields : allFields;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      {/* Tăng width component: max-w-5xl thay vì 4xl */}
      <DialogContent className="w-[95vw] max-w-3xl overflow-hidden sm:rounded-lg">
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
                {t('duplicateDesc')} (ID:{' '}
                <span className="font-bold text-foreground">{currentRecord.studentId}</span>)
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 w-full max-w-full overflow-x-auto">
              <Table className="border rounded-md">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[200px]">{t('dataSource')}</TableHead>
                    {/* Render linh hoạt các cột khác nhau */}
                    {displayFields.map((field) => (
                      <TableHead key={field.key} className="whitespace-nowrap">
                        {field.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/10">
                    <TableCell className="font-medium text-muted-foreground">
                      {t('existingRecord')}
                    </TableCell>
                    {displayFields.map((field) => (
                      <TableCell key={field.key}>{currentRecord.existing?.[field.key]}</TableCell>
                    ))}
                  </TableRow>

                  <TableRow className="bg-primary/5">
                    <TableCell className="font-medium text-primary">
                      {t('incomingRecord')}
                    </TableCell>
                    {displayFields.map((field) => (
                      <TableCell key={field.key}>{currentRecord.incoming?.[field.key]}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="flex flex-wrap justify-between items-center w-full gap-4 mt-2">
              <div className="flex items-center gap-6 w-full sm:w-auto overflow-hidden">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {currentIndex + 1} / {duplicates.length} {t('duplicatesRemaining')}
                </span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                <Button variant="outline" onClick={() => handleResolve('skip')} className="whitespace-nowrap">
                  {t('doNotOverwrite')}
                </Button>
                <Button onClick={() => handleResolve('overwrite')} className="whitespace-nowrap">
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