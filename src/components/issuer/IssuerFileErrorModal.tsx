import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface SearchComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string; group?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
}

function SearchCombobox({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);

  // Gom nhóm options nếu có group
  const groupedOptions = useMemo(() => {
    const hasGroup = options.some((o) => o.group);
    if (!hasGroup) return { default: options };
    const res: Record<string, typeof options> = {};
    options.forEach((o) => {
      const g = o.group || 'Khác';
      if (!res[g]) res[g] = [];
      res[g].push(o);
    });
    return res;
  }, [options]);

  const selectedLabel = options.find((o) => o.value.toLowerCase() === value.toLowerCase())?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 text-xs w-full justify-between font-normal px-2 bg-background border-input"
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDownIcon className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0 z-[100]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="max-h-[220px]">
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList
            className="max-h-[175px] overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
              Không tìm thấy kết quả
            </CommandEmpty>
            {Object.entries(groupedOptions).map(([groupName, groupItems]) => (
              <CommandGroup key={groupName} heading={groupName !== 'default' ? groupName : undefined}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="text-xs py-1.5 cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">{item.label}</span>
                    {value.toLowerCase() === item.value.toLowerCase() && (
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  SelectItem,
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
  isValidDateDDMMYYYY,
  isValidDecimalNumber,
  NATIONAL_ID_REGEX,
  CODE_KEY_REGEX,
  isValidGeneralText,
} from '@/utils/csvValidator';

/**
 * Kiếm tra xem giá trị đã sửa của một trường có hợp lệ hoàn toàn với tiêu chí format của trường đó hay không
 */
function validateFixedValue(err: CsvErrorRecord, val: string): boolean {
  if (err.type === 'duplicate') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // 1. Ngày sinh: Bắt buộc định dạng dd/mm/yyyy chuẩn
  if (err.targetField === 'dob') {
    return isValidDateDDMMYYYY(trimmed);
  }

  // 2. Điểm CPA: Số thập phân
  if (err.targetField === 'cpa') {
    return isValidDecimalNumber(trimmed);
  }

  // 3. Nơi sinh: Phải thuộc 63 Tỉnh/Thành
  if (err.targetField === 'place_of_birth') {
    return VIETNAM_PROVINCES.some((p) => p.toLowerCase() === trimmed.toLowerCase());
  }

  // 4. Xếp loại tốt nghiệp: Phải thuộc danh sách quy định
  if (err.targetField === 'classification') {
    return CLASSIFICATION_OPTIONS.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  }

  // 5. Loại bằng / chứng chỉ: Phải thuộc danh sách
  if (err.targetField === 'degree_type') {
    return (
      trimmed === 'Bằng tốt nghiệp đại học' ||
      DEGREE_TYPES.some((d) => d.label.toLowerCase() === trimmed.toLowerCase())
    );
  }

  // 6. Hình thức đào tạo: Phải thuộc danh sách
  if (err.targetField === 'mode_of_study') {
    return MODE_OF_STUDY_OPTIONS.some((m) => m.toLowerCase() === trimmed.toLowerCase());
  }

  // 7. Số CCCD: 12 chữ số bắt đầu bằng 0
  if (err.targetField === 'national_id') {
    return NATIONAL_ID_REGEX.test(trimmed);
  }

  // 8. Mã SV / Lớp: CODE_KEY_REGEX (2-15 ký tự chữ, số, -, _)
  if (err.targetField === 'student_id' || err.targetField === 'class_id') {
    return CODE_KEY_REGEX.test(trimmed);
  }

  // 9. Năm tốt nghiệp: từ 1930 đến (Năm hiện tại + 3)
  if (err.targetField === 'graduation_year') {
    const yr = parseInt(trimmed, 10);
    const maxYr = new Date().getFullYear() + 3;
    return !isNaN(yr) && yr >= 1930 && yr <= maxYr;
  }

  // 10. Họ tên và các trường chữ khác: 2-300 ký tự, không ký tự đặc biệt
  if (err.targetField === 'full_name') {
    return trimmed.length >= 2 && trimmed.length <= 200 && isValidGeneralText(trimmed, 2, 200);
  }

  return isValidGeneralText(trimmed, 2, 300);
}
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

export interface GroupedRowErrors {
  rowNumber: number;
  isDuplicate: boolean;
  errors: CsvErrorRecord[];
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
  // Quản lý giá trị sửa lỗi thủ công của từng trường trong từng dòng (Key: `${rowNumber}_${targetField}`)
  const [fixedValues, setFixedValues] = useState<Record<string, string>>({});
  // State quản lý các dòng được chọn gửi (Key: rowNumber)
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});

  // Gom nhóm các lỗi theo số dòng (rowNumber)
  const groupedRows: GroupedRowErrors[] = useMemo(() => {
    const map = new Map<number, GroupedRowErrors>();
    errors.forEach((err) => {
      if (!map.has(err.row)) {
        map.set(err.row, {
          rowNumber: err.row,
          isDuplicate: err.type === 'duplicate',
          errors: [],
        });
      }
      const group = map.get(err.row)!;
      if (err.type === 'duplicate') {
        group.isDuplicate = true;
      }
      group.errors.push(err);
    });
    return Array.from(map.values()).sort((a, b) => a.rowNumber - b.rowNumber);
  }, [errors]);

  // Kiểm tra xem 1 dòng có đạt chuẩn hợp lệ 100% hay không
  const isGroupValid = useCallback(
    (group: GroupedRowErrors, currentFixed: Record<string, string>) => {
      if (group.isDuplicate) return false;
      return group.errors.every((err) => {
        const valKey = `${group.rowNumber}_${err.targetField}`;
        const val = currentFixed[valKey] ?? autoSuggestFixedValue(err);
        return validateFixedValue(err, val);
      });
    },
    []
  );

  // Khởi tạo giá trị auto-fix & phân loại 3 nhóm mặc định khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const initialFixed: Record<string, string> = {};
      const initialSelected: Record<number, boolean> = {};

      groupedRows.forEach((group) => {
        let groupValid = !group.isDuplicate;

        group.errors.forEach((err) => {
          const suggested = autoSuggestFixedValue(err);
          const valKey = `${group.rowNumber}_${err.targetField}`;
          initialFixed[valKey] = suggested;

          if (suggested && suggested !== err.oldValue && onFixError && err.targetField) {
            onFixError(err.row, err.targetField, suggested);
          }

          if (err.type === 'format' && !validateFixedValue(err, suggested)) {
            groupValid = false;
          }
        });

        // 1. Nhóm Hợp lệ (Không duplicate, đã auto-fix đạt chuẩn): Tự động tick chọn sẵn
        // 2. Nhóm Duplicate hoặc Lỗi chưa sửa: Tự động bỏ tick
        if (!group.isDuplicate && groupValid) {
          initialSelected[group.rowNumber] = true;
        } else {
          initialSelected[group.rowNumber] = false;
        }
      });

      setFixedValues(initialFixed);
      setSelectedRows(initialSelected);
    }
  }, [isOpen, errors, groupedRows]);

  if (!isOpen || errors.length === 0) return null;

  // Tính toán số lượng cho 3 nhóm
  const validGroupRows = groupedRows.filter((g) => isGroupValid(g, fixedValues));
  const validRowsCount = validGroupRows.length;
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  // Nút hành động 1: "Chỉ gửi các dòng hợp lệ (X sinh viên)"
  const handleSendValidOnly = () => {
    const validRowIndexes = validGroupRows.map((g) => g.rowNumber);
    if (onProcessSelectedRows) {
      onProcessSelectedRows(validRowIndexes);
    } else {
      onContinue();
    }
  };

  // Nút hành động 2: "Gửi X dòng đã chọn"
  const handleSendSelected = () => {
    const selectedNums = Object.keys(selectedRows)
      .map(Number)
      .filter((r) => selectedRows[r]);
    if (onProcessSelectedRows) {
      onProcessSelectedRows(selectedNums);
    } else {
      onContinue();
    }
  };

  // Click vào Badge trạng thái để chuyển đổi Sẽ gửi / Sẽ bỏ qua
  const toggleRowBadgeStatus = (group: GroupedRowErrors) => {
    if (group.isDuplicate) return;
    const isValid = isGroupValid(group, fixedValues);
    if (!isValid) return; // Không cho phép chọn gửi khi thông tin vẫn còn lỗi

    setSelectedRows((prev) => ({
      ...prev,
      [group.rowNumber]: !prev[group.rowNumber],
    }));
  };

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

  const handleFieldValueChange = (
    group: GroupedRowErrors,
    err: CsvErrorRecord,
    val: string
  ) => {
    const valKey = `${group.rowNumber}_${err.targetField}`;
    const nextFixed = { ...fixedValues, [valKey]: val };
    setFixedValues(nextFixed);

    if (onFixError && err.targetField) {
      onFixError(err.row, err.targetField, val);
    }

    // Tự động chuyển xanh và tick chọn dòng khi sửa đạt 100% chuẩn format
    const valid = isGroupValid(group, nextFixed);
    setSelectedRows((prev) => ({
      ...prev,
      [group.rowNumber]: valid,
    }));
  };

  const renderFixedInputForErr = (
    group: GroupedRowErrors,
    err: CsvErrorRecord
  ) => {
    // Nếu là trùng lặp trong file (duplicate): Hiển thị gợi ý chọn dòng giữ bằng Dropdown chọn nhanh
    if (err.type === 'duplicate') {
      const prevRow = err.detailParams?.prevRow;
      return (
        <Select
          defaultValue="keep_first"
          onValueChange={(val) => {
            if (val === 'keep_this') {
              // Người dùng chọn giữ dòng này thay vì dòng trước
              setSelectedRows((prev) => ({
                ...prev,
                [group.rowNumber]: true,
                [Number(prevRow)]: false,
              }));
            } else {
              setSelectedRows((prev) => ({
                ...prev,
                [group.rowNumber]: false,
                [Number(prevRow)]: true,
              }));
            }
          }}
        >
          <SelectTrigger className="h-8 text-xs w-full bg-amber-50 dark:bg-amber-950/40 border-amber-300">
            <SelectValue placeholder="Chọn dòng giữ lại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keep_first" className="text-xs">
              Giữ dòng {prevRow || 1} (Mặc định)
            </SelectItem>
            <SelectItem value="keep_this" className="text-xs">
              Giữ dòng {group.rowNumber} này
            </SelectItem>
          </SelectContent>
        </Select>
      );
    }

    const valKey = `${group.rowNumber}_${err.targetField}`;
    const currentVal = fixedValues[valKey] ?? autoSuggestFixedValue(err) ?? '';
    const isFieldValid = validateFixedValue(err, currentVal);

    // Style viền đỏ trực tiếp (inline red border) giống Excel khi ô bị sai format
    const inputStyleClass = isFieldValid
      ? 'h-8 text-xs border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 focus:ring-emerald-500'
      : 'h-8 text-xs border-destructive bg-destructive/10 text-destructive focus:ring-destructive animate-pulse';

    // Render SearchCombobox cho Nơi sinh
    if (err.targetField === 'place_of_birth') {
      const provinceOptions = VIETNAM_PROVINCES.map((p) => ({ label: p, value: p }));
      return (
        <SearchCombobox
          value={currentVal}
          onChange={(val) => handleFieldValueChange(group, err, val)}
          options={provinceOptions}
          placeholder="Chọn Tỉnh/Thành"
          searchPlaceholder="Tìm Tỉnh/Thành..."
        />
      );
    }

    // Render Dropdown cho Xếp loại
    if (err.targetField === 'classification') {
      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleFieldValueChange(group, err, val)}
        >
          <SelectTrigger className={`w-full ${inputStyleClass}`}>
            <SelectValue placeholder="Chọn Xếp loại" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {CLASSIFICATION_OPTIONS.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Render SearchCombobox cho Loại bằng
    if (err.targetField === 'degree_type') {
      const degreeOptions = DEGREE_TYPES.map((d) => ({
        label: d.label,
        value: d.label,
        group: d.category,
      }));

      return (
        <SearchCombobox
          value={currentVal}
          onChange={(val) => handleFieldValueChange(group, err, val)}
          options={degreeOptions}
          placeholder="Chọn Loại bằng / Chứng chỉ"
          searchPlaceholder="Tìm loại bằng..."
        />
      );
    }

    // Render Dropdown cho Hình thức đào tạo
    if (err.targetField === 'mode_of_study') {
      return (
        <Select
          value={currentVal}
          onValueChange={(val) => handleFieldValueChange(group, err, val)}
        >
          <SelectTrigger className={`w-full ${inputStyleClass}`}>
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

    // Render Dropdown cho Giới tính
    if (err.targetField === 'gender') {
      return (
        <Select
          value={currentVal || 'Nam'}
          onValueChange={(val) => handleFieldValueChange(group, err, val === 'N' ? 'N' : '')}
        >
          <SelectTrigger className={`w-full ${inputStyleClass}`}>
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
            const raw = e.target.value;
            if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
              const [y, m, d] = raw.split('-');
              handleFieldValueChange(group, err, `${d}/${m}/${y}`);
            } else {
              handleFieldValueChange(group, err, raw);
            }
          }}
          className={inputStyleClass}
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
            handleFieldValueChange(group, err, onlyDigits);
          }}
          placeholder="079203012345 (12 số)"
          className={`${inputStyleClass} font-mono`}
        />
      );
    }

    // Default: Input text với viền đỏ trực tiếp nếu sai format
    return (
      <Input
        value={currentVal}
        onChange={(e) => handleFieldValueChange(group, err, e.target.value)}
        placeholder="Nhập giá trị đúng..."
        className={inputStyleClass}
      />
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCancel();
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl w-[96vw] max-h-[90vh] flex flex-col sm:rounded-lg p-6 gap-4">
          <DialogHeader className="shrink-0 border-b pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  {t('fileErrorsDetected')}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-1">
                  {t('fileErrorsDesc')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Bảng hiển thị danh sách dòng lỗi */}
          <div className="flex-1 overflow-y-auto border rounded-md max-h-[400px]">
            <Table className="w-full relative border-collapse">
              <TableHeader className="bg-muted sticky top-0 z-20 shadow-sm">
                <TableRow>
                  <TableHead className="w-[50px] text-center">{t('rowNumber')}</TableHead>
                  <TableHead className="w-[120px]">{t('issueType')}</TableHead>
                  <TableHead className="w-[140px]">Trường thông tin</TableHead>
                  <TableHead className="w-[140px]">Dữ liệu gốc</TableHead>
                  <TableHead className="w-[200px]">Sửa trực tiếp</TableHead>
                  <TableHead className="min-w-[240px]">{t('issueDetail')}</TableHead>
                  <TableHead className="w-[100px] text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRows.map((group) => {
                  const isSelected = !!selectedRows[group.rowNumber];
                  const isValid = isGroupValid(group, fixedValues);
                  const errorCount = group.errors.length;

                  // Xác định phân loại 3 nhóm
                  let categoryTag = { label: 'Lỗi thông tin', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
                  if (group.isDuplicate) {
                    categoryTag = { label: 'Trùng trong file', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
                  } else if (isValid) {
                    categoryTag = { label: 'Đã sửa hợp lệ', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
                  }

                  return group.errors.map((err, errIdx) => (
                    <TableRow
                      key={`${group.rowNumber}_${errIdx}`}
                      className={`${isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''} ${errIdx === errorCount - 1 ? 'border-b-2 border-border' : 'border-b-0'
                        }`}
                    >
                      {/* Cột Số Dòng */}
                      {errIdx === 0 && (
                        <TableCell rowSpan={errorCount} className="font-bold text-center align-top pt-3 border-r">
                          {group.rowNumber}
                        </TableCell>
                      )}

                      {/* Cột Trạng thái phân loại */}
                      {errIdx === 0 && (
                        <TableCell rowSpan={errorCount} className="align-top pt-3 border-r">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${categoryTag.color}`}>
                            {categoryTag.label}
                          </span>
                        </TableCell>
                      )}

                      {/* Cột Trường thông tin */}
                      <TableCell className="w-[140px] font-medium text-xs py-2">
                        {err.fieldName || 'Dữ liệu'}
                      </TableCell>

                      {/* Cột Dữ liệu gốc */}
                      <TableCell className="w-[140px] text-xs text-muted-foreground bg-muted/30 font-mono py-2 truncate max-w-[140px]">
                        {err.oldValue !== undefined && err.oldValue !== '' ? err.oldValue : '(Trống)'}
                      </TableCell>

                      {/* Cột Sửa trực tiếp (Inline editing) */}
                      <TableCell className="w-[200px] py-2">
                        {renderFixedInputForErr(group, err)}
                      </TableCell>

                      {/* Cột Chi tiết vấn đề */}
                      <TableCell className="text-muted-foreground text-xs py-2">
                        {getErrorMessage(err)}
                      </TableCell>

                      {/* Cột Badge Trạng Thái Hành Động (Sẽ gửi / Sẽ bỏ qua) */}
                      {errIdx === 0 && (
                        <TableCell rowSpan={errorCount} className="text-center align-top pt-3 border-l">
                          <Button
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            disabled={!isValid && !group.isDuplicate}
                            onClick={() => toggleRowBadgeStatus(group)}
                            className={`h-7 px-2.5 text-xs font-semibold transition-all ${isSelected
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'text-muted-foreground border-dashed hover:border-solid'
                              }`}
                          >
                            {isSelected ? t('badgeWillSend') : t('badgeWillSkip')}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
            <Button variant="outline" onClick={onCancel}>
              {t('cancelUpload')}
            </Button>

            <div className="flex flex-wrap flex-row justify-end gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handleSendValidOnly}
                className="font-medium text-xs"
              >
                {t('continueWithoutErrors')} ({validRowsCount})
              </Button>
              <Button
                onClick={handleSendSelected}
                disabled={selectedCount === 0}
                className="bg-primary text-primary-foreground font-semibold text-xs"
              >
                {t('sendSelectedRowsBtn').replace('{X}', String(selectedCount))}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
