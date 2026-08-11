import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  VIETNAM_PROVINCES,
  DEGREE_TYPES,
  MODE_OF_STUDY_OPTIONS,
  CLASSIFICATION_OPTIONS,
} from '@/utils/credentialConstants';
import type { CsvCredentialRow } from '@/utils/csvValidator';

export interface CsvErrorRecord {
  row: number;
  type: 'format' | 'duplicate';
  detailKey: string;
  detailParams?: Record<string, string | number>;
  detailMessage?: string;
  fieldName?: string;
  targetField?: keyof CsvCredentialRow;
  oldValue?: string;
}

interface IssuerFileErrorModalProps {
  isOpen: boolean;
  t: (k: string) => string;
  errors: CsvErrorRecord[];
  onContinue: () => void;
  onCancel: () => void;
  onFixError?: (rowIndex: number, targetField: keyof CsvCredentialRow, newValue: string) => void;
}

export function IssuerFileErrorModal({
  isOpen,
  t,
  errors,
  onContinue,
  onCancel,
  onFixError,
}: IssuerFileErrorModalProps) {
  // Quản lý giá trị sửa lỗi thủ công của từng dòng
  const [fixedValues, setFixedValues] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<number, string> = {};
      errors.forEach((err, idx) => {
        initial[idx] = err.oldValue || '';
      });
      setFixedValues(initial);
    }
  }, [isOpen, errors]);

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

  const handleValueChange = (index: number, val: string, err: CsvErrorRecord) => {
    setFixedValues((prev) => ({ ...prev, [index]: val }));
    if (onFixError && err.targetField) {
      onFixError(err.row, err.targetField, val);
    }
  };

  const renderFixedInput = (err: CsvErrorRecord, index: number) => {
    const currentVal = fixedValues[index] ?? err.oldValue ?? '';

    // Render Dropdown nếu là Nơi sinh
    if (err.targetField === 'place_of_birth') {
      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleValueChange(index, val, err)}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Chọn Tỉnh/Thành" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {VIETNAM_PROVINCES.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Render Dropdown nếu là Xếp loại
    if (err.targetField === 'classification') {
      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleValueChange(index, val, err)}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Chọn Xếp loại" />
          </SelectTrigger>
          <SelectContent>
            {CLASSIFICATION_OPTIONS.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Render Dropdown nếu là Loại bằng
    if (err.targetField === 'degree_type') {
      const vanBangList = DEGREE_TYPES.filter((d) => d.category === 'Văn bằng');
      const chungChiList = DEGREE_TYPES.filter((d) => d.category === 'Chứng chỉ');

      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleValueChange(index, val, err)}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Chọn Loại bằng / Chứng chỉ" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            <SelectGroup>
              <SelectLabel className="text-xs font-bold text-primary">Văn bằng</SelectLabel>
              {vanBangList.map((item) => (
                <SelectItem key={item.label} value={item.label} className="text-xs">
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-xs font-bold text-primary">Chứng chỉ</SelectLabel>
              {chungChiList.map((item) => (
                <SelectItem key={item.label} value={item.label} className="text-xs">
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }

    // Render Dropdown nếu là Hình thức đào tạo
    if (err.targetField === 'mode_of_study') {
      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleValueChange(index, val, err)}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Chọn Hình thức đào tạo" />
          </SelectTrigger>
          <SelectContent>
            {MODE_OF_STUDY_OPTIONS.map((m) => (
              <SelectItem key={m} value={m} className="text-xs">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Render Dropdown nếu là Giới tính
    if (err.targetField === 'gender') {
      return (
        <Select
          value={currentVal || 'Nam'}
          onValueChange={(val) => handleValueChange(index, val === 'N' ? 'N' : '', err)}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Chọn Giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nam" className="text-xs">Nam (để trống)</SelectItem>
            <SelectItem value="N" className="text-xs">Nữ (N)</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Default: Input text cho phép user nhập chỉnh sửa
    return (
      <Input
        value={currentVal}
        onChange={(e) => handleValueChange(index, e.target.value, err)}
        placeholder="Nhập giá trị đúng..."
        className="h-8 text-xs"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-5xl w-[94vw] max-h-[85vh] flex flex-col sm:rounded-lg p-6 gap-4">
        <DialogHeader className="shrink-0 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <AlertCircle className="w-5 h-5" />
            {t('csvErrorsDetected')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t('csvErrorsDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-auto border rounded-md max-h-[380px]">
          <Table className="w-full relative">
            <TableHeader className="bg-muted/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <TableRow>
                <TableHead className="w-[60px] text-center">{t('rowNumber')}</TableHead>
                <TableHead className="w-[100px]">{t('issueType')}</TableHead>
                <TableHead className="w-[130px]">Trường dữ liệu</TableHead>
                <TableHead className="w-[180px]">Giá trị cũ (Gốc)</TableHead>
                <TableHead className="min-w-[200px]">Giá trị đã sửa (Có thể chỉnh)</TableHead>
                <TableHead className="min-w-[220px]">{t('issueDetail')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-center">{error.row}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      error.type === 'duplicate'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {error.type === 'duplicate' ? 'Trùng lặp' : 'Định dạng'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {error.fieldName || 'Dữ liệu'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground bg-muted/40 font-mono">
                    {error.oldValue !== undefined && error.oldValue !== '' ? error.oldValue : '(Trống)'}
                  </TableCell>
                  <TableCell>
                    {renderFixedInput(error, index)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{getErrorMessage(error)}</TableCell>
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
