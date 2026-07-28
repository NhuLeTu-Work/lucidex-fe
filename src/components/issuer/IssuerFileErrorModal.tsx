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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[95vw] max-w-3xl overflow-hidden sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            {t('csvErrorsDetected')}
          </DialogTitle>
          <DialogDescription>
            {t('csvErrorsDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 w-full max-w-full overflow-x-auto">
          <Table className="border rounded-md">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">{t('rowNumber')}</TableHead>
                <TableHead className="w-[150px]">{t('issueType')}</TableHead>
                <TableHead>{t('issueDetail')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-center">{error.row}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      error.type === 'duplicate' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {error.type === 'duplicate' ? 'Duplicate' : 'Format'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t(error.detailKey)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex flex-wrap justify-end gap-2 mt-4">
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