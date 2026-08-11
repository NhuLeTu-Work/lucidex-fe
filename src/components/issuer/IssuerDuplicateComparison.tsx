import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { formatDateDDMMYYYY } from '@/utils/timeUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';

export interface DuplicateRecord {
  studentId: string;
  classCode?: string;
  rowNumber?: number;
  existing: any;
  incoming: any;
}

interface IssuerDuplicateComparisonProps {
  isOpen: boolean;
  t: (k: string) => string;
  duplicates: DuplicateRecord[];
  onComplete: (action: 'overwrite' | 'skip') => void;
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

  const handleResolve = (action: 'overwrite' | 'skip') => {
    if (currentIndex < duplicates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleting(true);
      setTimeout(() => {
        setIsCompleting(false);
        setCurrentIndex(0);
        setDeletedRecords([]); // Clear store sau khi hoàn tất
        onComplete(action);
      }, 1000);
    }
  };

  if (!isOpen || duplicates.length === 0) return null;

  const currentRecord = duplicates[currentIndex];

  // Khai báo danh sách các trường cần kiểm tra và hiển thị
  // Hỗ trợ cả tên trường trong `existing`/`incoming` lẫn thuộc tính ở cấp root của currentRecord
  const allFields = [
    {
      key: 'studentId',
      altKeys: ['student_id', 'studentId'],
      label: 'Mã SV / MSSV',
      getValueFromRecord: () => currentRecord.studentId,
    },
    {
      key: 'classCode',
      altKeys: ['class_code', 'class_id', 'classCode'],
      label: 'Lớp',
      getValueFromRecord: () => currentRecord.classCode,
    },
    {
      key: 'fullName',
      altKeys: ['full_name', 'fullName'],
      label: t('fullName') || 'Họ và tên',
    },
    {
      key: 'dob',
      altKeys: ['dob', 'date_of_birth'],
      label: t('dob') || 'Ngày sinh',
    },
    {
      key: 'modeStudy',
      altKeys: ['mode_of_study_vi', 'mode_of_study', 'modeStudy'],
      label: 'Hình thức đào tạo',
    },
    {
      key: 'classification',
      altKeys: ['graduation_classification_vi', 'classification', 'graduation_classification'],
      label: t('classification') || 'Xếp loại tốt nghiệp',
    },
    {
      key: 'major',
      altKeys: ['major_vi', 'major', 'major_en'],
      label: t('major') || 'Ngành học',
    },
    {
      key: 'gradYear',
      altKeys: ['graduation_year', 'gradYear'],
      label: t('gradYear') || 'Năm tốt nghiệp',
    },
  ];

  const getFieldValue = (record: any, field: any) => {
    let val = '';
    if (record) {
      for (const k of field.altKeys || []) {
        if (record[k] !== undefined && record[k] !== null && record[k] !== '') {
          val = record[k];
          break;
        }
      }
    }
    // Nếu trong record không có (ví dụ backend trả student_id & class_code ở cấp item root)
    if (!val && field.getValueFromRecord) {
      val = field.getValueFromRecord() || '';
    }
    if (field.key === 'dob' && val) {
      return formatDateDDMMYYYY(val);
    }
    return String(val);
  };

  // Luôn hiển thị đầy đủ tất cả các trường thông tin để so sánh trực quan
  const displayFields = allFields;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      {/* Tăng width component lên sm:max-w-6xl w-[96vw] để xem hết các cột không bị scrollbar ngang */}
      <DialogContent className="sm:max-w-6xl w-[96vw] max-h-[88vh] flex flex-col sm:rounded-lg p-6 overflow-hidden">
        {isCompleting ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold">{t('processingDuplicates')}</h3>
            <p className="text-sm text-muted-foreground">{t('pleaseWait')}</p>
          </div>
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b pb-3">
              <DialogTitle className="flex items-center gap-2 text-amber-600 text-xl font-bold">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                {t('duplicateDetected')}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t('duplicateDesc')} (Mã SV:{' '}
                <span className="font-bold text-foreground">{currentRecord.studentId}</span>
                {currentRecord.classCode ? `, Lớp: ${currentRecord.classCode}` : ''})
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto overflow-x-hidden border rounded-md my-3">
              <Table className="w-full relative border-collapse">
                <TableHeader className="bg-muted/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                  <TableRow>
                    <TableHead className="w-[140px] font-bold">{t('dataSource')}</TableHead>
                    {/* Render linh hoạt các cột khác nhau */}
                    {displayFields.map((field) => (
                      <TableHead key={field.key} className="font-bold">
                        {field.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/10 hover:bg-muted/20">
                    <TableCell className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
                      {t('existingRecord')} (Đã lưu)
                    </TableCell>
                    {displayFields.map((field) => (
                      <TableCell key={field.key} className="text-xs font-mono">
                        {getFieldValue(currentRecord.existing, field) || '(Trống)'}
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow className="bg-primary/5 hover:bg-primary/10">
                    <TableCell className="font-semibold text-primary bg-primary/10">
                      {t('incomingRecord')} (File mới)
                    </TableCell>
                    {displayFields.map((field) => (
                      <TableCell key={field.key} className="text-xs font-mono font-medium">
                        {getFieldValue(currentRecord.incoming, field) || '(Trống)'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="shrink-0 flex flex-wrap justify-between items-center w-full gap-4 pt-2 border-t">
              <div className="flex items-center gap-6 w-full sm:w-auto overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
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