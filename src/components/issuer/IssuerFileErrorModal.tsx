import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  capitalizeWords,
  capitalizeFirstLetter,
} from '@/utils/csvValidator';
import type { CsvCredentialRow } from '@/utils/csvValidator';
import { Input } from '../ui/input';
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
  onProcessSelectedRows?: (selectedRowIndexes: number[]) => void;
}

// Tự động gợi ý/sửa giá trị đúng format ban đầu (nếu có thể auto-fix)
function autoSuggestFixedValue(err: CsvErrorRecord): string {
  // Lỗi trùng lặp (duplicate) -> Không hiển thị giá trị ở cột giá trị đã sửa
  if (err.type === 'duplicate') {
    return '';
  }

  const val = (err.oldValue || '').trim();
  if (!val) return '';

  // 1. Auto fix ngày sinh:
  // VD: 10-08-2003 hay 10.08.2003 -> 10/08/2003
  // VD: 2003-08-10 hay 2003/08/10 -> 10/08/2003
  if (err.targetField === 'dob') {
    // TH1: DD-MM-YYYY hoặc DD.MM.YYYY -> DD/MM/YYYY
    const matchDDMMYYYY = val.match(/^(\d{1,2})[\-\.](\d{1,2})[\-\.](\d{4})$/);
    if (matchDDMMYYYY) {
      const [, d, m, y] = matchDDMMYYYY;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // TH2: YYYY/MM/DD hoặc YYYY-MM-DD -> DD/MM/YYYY
    const matchYYYYMMDD = val.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (matchYYYYMMDD) {
      const [, y, m, d] = matchYYYYMMDD;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }

  // 2. Auto fix điểm CPA: dấu phẩy "3,4" -> "3.4"
  if (err.targetField === 'cpa') {
    if (val.includes(',')) {
      const replaced = val.replace(',', '.');
      if (!isNaN(Number(replaced))) return replaced;
    }
  }

  // 3. Auto fix Nơi sinh: Capslock từng từ (Title Case) + loại bỏ số & ký tự đặc biệt
  // VD: "cần thơ 123#" -> "Cần Thơ" (khớp với 63 tỉnh thành)
  if (err.targetField === 'place_of_birth') {
    const formatted = capitalizeWords(val);
    const matched = VIETNAM_PROVINCES.find((p) => p.toLowerCase() === formatted.toLowerCase());
    if (matched) return matched;
    if (formatted) return formatted;
  }

  // 4. Auto fix Hình thức đào tạo: Capslock chữ đầu + loại bỏ số & ký tự đặc biệt
  // VD: "chính quy 1!" -> "Chính quy"
  if (err.targetField === 'mode_of_study') {
    const formatted = capitalizeFirstLetter(val);
    const matched = MODE_OF_STUDY_OPTIONS.find((m) => m.toLowerCase() === formatted.toLowerCase());
    if (matched) return matched;
    if (formatted) return formatted;
  }

  // 5. Auto fix Loại bằng: Capslock chữ đầu + loại bỏ số & ký tự đặc biệt
  // VD: "cử nhân @" -> "Cử nhân"
  if (err.targetField === 'degree_type') {
    const formatted = capitalizeFirstLetter(val);
    const matched = DEGREE_TYPES.find((d) => d.label.toLowerCase() === formatted.toLowerCase());
    if (matched) return matched.label;
    if (formatted) return formatted;
  }

  // 6. Auto fix Giới tính: N/Nữ/Female -> 'N', Nam/Male -> ''
  if (err.targetField === 'gender') {
    const upper = val.toUpperCase();
    if (['N', 'NỮ', 'NU', 'FEMALE'].includes(upper)) return 'N';
    if (['NAM', 'MALE'].includes(upper)) return 'Nam';
  }

  return val;
}

export function IssuerFileErrorModal({
  isOpen,
  t,
  errors,
  onContinue,
  onCancel,
  onFixError,
  onProcessSelectedRows,
}: IssuerFileErrorModalProps) {
  // Quản lý giá trị sửa lỗi thủ công của từng dòng
  const [fixedValues, setFixedValues] = useState<Record<number, string>>({});
  // State quản lý việc hiển thị modal xác nhận đóng
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  // State quản lý các dòng được tick checkbox chọn xử lý (tự động tích chọn tất cả dòng lỗi format)
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const initialFixed: Record<number, string> = {};
      const initialSelected: Record<number, boolean> = {};

      errors.forEach((err, idx) => {
        const suggested = autoSuggestFixedValue(err);
        initialFixed[idx] = suggested;
        // Báo về cho parent nếu gợi ý sửa khác giá trị cũ
        if (suggested && suggested !== err.oldValue && onFixError && err.targetField) {
          onFixError(err.row, err.targetField, suggested);
        }
        // Tự động tick checkbox chọn các dòng lỗi format
        if (err.type === 'format') {
          initialSelected[err.row] = true;
        }
      });
      setFixedValues(initialFixed);
      setSelectedRows(initialSelected);
      setShowConfirmClose(false);
    }
  }, [isOpen, errors]);

  if (!isOpen || errors.length === 0) return null;

  // Danh sách các dòng lỗi định dạng (format)
  const formatErrorRows = errors.filter((e) => e.type === 'format');
  const allFormatSelected =
    formatErrorRows.length > 0 &&
    formatErrorRows.every((e) => selectedRows[e.row]);

  const toggleSelectAllFormat = () => {
    setSelectedRows((prev) => {
      const updated = { ...prev };
      const nextState = !allFormatSelected;
      formatErrorRows.forEach((e) => {
        updated[e.row] = nextState;
      });
      return updated;
    });
  };

  const toggleSelectRow = (rowNum: number) => {
    const errObj = errors.find((e) => e.row === rowNum);
    if (errObj && errObj.type === 'duplicate') return;

    setSelectedRows((prev) => ({
      ...prev,
      [rowNum]: !prev[rowNum],
    }));
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

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

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onCancel();
  };

  const renderFixedInput = (err: CsvErrorRecord, index: number) => {
    // Nếu là dòng trùng lặp (duplicate) -> Không hiển thị ô sửa ở cột Giá trị đã sửa
    if (err.type === 'duplicate') {
      return <span className="text-muted-foreground italic text-xs">-</span>;
    }

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

    // Render HTML Date Picker cho Ngày sinh
    if (err.targetField === 'dob') {
      // Chuyển đổi DD/MM/YYYY hoặc các dạng khác sang YYYY-MM-DD để hiển thị datepicker
      let datePickerVal = '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(currentVal)) {
        const [d, m, y] = currentVal.split('/');
        datePickerVal = `${y}-${m}-${d}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
        datePickerVal = currentVal;
      }

      return (
        <Input
          type="date"
          value={datePickerVal}
          onChange={(e) => {
            const raw = e.target.value; // YYYY-MM-DD
            if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
              const [y, m, d] = raw.split('-');
              handleValueChange(index, `${d}/${m}/${y}`, err);
            } else {
              handleValueChange(index, raw, err);
            }
          }}
          className="h-8 text-xs font-sans"
        />
      );
    }

    // Render Input hạn chế 12 chữ số cho CCCD
    if (err.targetField === 'national_id') {
      return (
        <Input
          type="text"
          maxLength={12}
          value={currentVal}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 12);
            handleValueChange(index, onlyDigits, err);
          }}
          placeholder="079203012345 (12 số)"
          className="h-8 text-xs font-mono"
        />
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
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmClose(true);
          }
        }}
      >
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
                  <TableHead className="w-[45px] text-center">
                    <Checkbox
                      checked={allFormatSelected}
                      onCheckedChange={toggleSelectAllFormat}
                      title={t('selectAllFormatErrors') || 'Chọn tất cả dòng lỗi định dạng'}
                    />
                  </TableHead>
                  <TableHead className="w-[60px] text-center">{t('rowNumber')}</TableHead>
                  <TableHead className="w-[100px]">{t('issueType')}</TableHead>
                  <TableHead className="w-[130px]">Trường dữ liệu</TableHead>
                  <TableHead className="w-[180px]">Giá trị cũ (Gốc)</TableHead>
                  <TableHead className="min-w-[200px]">Giá trị đã sửa</TableHead>
                  <TableHead className="min-w-[220px]">{t('issueDetail')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error, index) => {
                  const isSelected = !!selectedRows[error.row];
                  return (
                    <TableRow key={index} className={isSelected ? 'bg-primary/5' : undefined}>
                      <TableCell className="text-center">
                        {error.type === 'duplicate' ? (
                          <span className="text-muted-foreground italic text-xs select-none">-</span>
                        ) : (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(error.row)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-center">{error.row}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${error.type === 'duplicate'
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
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
            <div className="flex flex-wrap flex-row justify-end gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setShowConfirmClose(true)}>
                {t('cancelUpload')}
              </Button>
              <Button variant="secondary" onClick={onContinue}>
                {t('continueWithoutErrors')}
              </Button>
              <Button
                onClick={() => {
                  const selectedNums = Object.keys(selectedRows)
                    .map(Number)
                    .filter((r) => selectedRows[r]);
                  if (onProcessSelectedRows) {
                    onProcessSelectedRows(selectedNums);
                  } else {
                    onContinue();
                  }
                }}
                disabled={selectedCount === 0}
                className="bg-primary text-primary-foreground font-semibold"
              >
                {t('processSelectedRows') || 'Xử lý các dòng đã chọn'} ({selectedCount})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal khi click nút 'X' hoặc 'Hủy' */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t('confirmCancelUploadTitle') || 'Xác nhận hủy quá trình tải lên?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
              {t('confirmCancelUploadDesc') || 'Mọi thay đổi đã chỉnh sửa trong danh sách lỗi sẽ không được lưu. Bạn có chắc chắn muốn thoát?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 pt-3">
            <AlertDialogCancel onClick={() => setShowConfirmClose(false)}>
              {t('continueEditingBtn') || 'Tiếp tục chỉnh sửa'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('confirmCloseBtn') || 'Xác nhận đóng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
