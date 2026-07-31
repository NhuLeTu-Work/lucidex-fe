import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface CsvErrorRecord {
  row: number;
  type: 'format' | 'duplicate';
  detailKey: string; // Key dịch cho chi tiết lỗi
  detailParams?: Record<string, string | number>;
  detailMessage?: string;
}

interface IssuerFileErrorModalProps {
  isOpen: boolean;
  t: (k: string) => string;
  errors: CsvErrorRecord[];
  onContinue: () => void;
  onCancel: () => void;
}

export function IssuerFileErrorModal({
  isOpen,
  t,
  errors,
  onContinue,
  onCancel,
}: IssuerFileErrorModalProps) {
  if (!isOpen || errors.length === 0) return null;

  const getErrorMessage = (error: CsvErrorRecord) => {
    let message = t(error.detailKey);
    if (message === error.detailKey && error.detailMessage) {
      message = error.detailMessage;
    }
    if (error.detailParams) {
      Object.entries(error.detailParams).forEach(([paramKey, paramVal]) => {
        message = message.replace(`{${paramKey}}`, String(paramVal));
      });
    }
    return message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[80vh] flex flex-col sm:rounded-lg p-6 gap-4">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <AlertCircle className="w-5 h-5" />
            {t('csvErrorsDetected')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t('csvErrorsDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-auto border rounded-md max-h-[320px]">
          <Table className="w-full relative">
            <TableHeader className="bg-muted/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <TableRow>
                <TableHead className="w-[90px] text-center">{t('rowNumber')}</TableHead>
                <TableHead className="w-[130px]">{t('issueType')}</TableHead>
                <TableHead>{t('issueDetail')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-center">{error.row}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      error.type === 'duplicate'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {error.type === 'duplicate' ? 'Duplicate' : 'Format'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getErrorMessage(error)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="shrink-0 flex flex-row justify-end gap-3 pt-3 border-t">
          <Button variant="outline" onClick={onCancel}>
            {t('cancelUpload')}
          </Button>
          <Button onClick={onContinue}>
            {t('continueWithoutErrors')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


