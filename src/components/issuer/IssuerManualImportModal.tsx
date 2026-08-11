import { useState, useMemo } from 'react';
import { useApp } from '@/app/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CheckIcon, ChevronsUpDownIcon, UserPlus, Loader2 } from 'lucide-react';
import { importManualCredentialApi } from '@/api/endpoints/issuer/importManualCredentialApi';
import type { ImportManualCredentialPayload } from '@/api/endpoints/issuer/importManualCredentialApi';
import {
  CODE_KEY_REGEX,
  isValidGeneralText,
  isValidDecimalNumber,
  sanitizeTextField,
  extractGraduationYear,
} from '@/utils/csvValidator';
import { VIETNAM_PROVINCES, DEGREE_TYPES, MODE_OF_STUDY_OPTIONS } from '@/utils/credentialConstants';

interface SearchComboboxProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string; group?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function SearchCombobox({
  id,
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);

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
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 text-sm w-full justify-between font-normal px-3 bg-background border-input"
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 z-[100]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="max-h-[260px]">
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList
            className="max-h-[200px] overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
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
                    className="text-sm py-2 cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">{item.label}</span>
                    {value.toLowerCase() === item.value.toLowerCase() && (
                      <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
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

interface IssuerManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Suy luận Xếp loại tốt nghiệp tự động từ điểm CPA
function getAutoClassification(cpaStr: string): string {
  if (!cpaStr.trim()) return '';
  const num = Number(cpaStr.trim());
  if (isNaN(num)) return '';
  if (num >= 3.6) return 'Xuất sắc';
  if (num >= 3.2) return 'Giỏi';
  if (num >= 2.5) return 'Khá';
  if (num >= 2.0) return 'Trung bình';
  return 'Trung bình';
}

const getInitialFormData = () => ({
  student_id: '',
  full_name: '',
  dob: '',
  place_of_birth: '',
  gender: '',
  class_id: '',
  faculty: '',
  major: '',
  specialization: '',
  cpa: '',
  classification: '',
  degree_number: '',
  register_number: '',
  national_id: '',
  degree_type: "Cử nhân (Bachelor's Degree)",
  graduation_year: String(new Date().getFullYear()),
  mode_of_study: 'Chính quy',
  university_email: '',
  overwrite: false,
});

// Chuyển đổi giữa YYYY-MM-DD từ input date và DD/MM/YYYY cho backend/validation
function convertDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

function isValidDateDDMMYYYY(dateStr: string): boolean {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

export function IssuerManualImportModal({
  isOpen,
  onClose,
  onSuccess,
}: IssuerManualImportModalProps) {
  const { t, showToast } = useApp();
  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Nếu thay đổi điểm CPA -> tự động suy luận xếp loại
      if (field === 'cpa') {
        updated.classification = getAutoClassification(value);
      }
      return updated;
    });
  };

  const handleReset = () => {
    setFormData(getInitialFormData());
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize slash inputs '\' -> '/'
    const sId = sanitizeTextField(formData.student_id);
    const fName = sanitizeTextField(formData.full_name);
    const dobVal = convertDateToDDMMYYYY(formData.dob);
    const cId = sanitizeTextField(formData.class_id);
    const placeBirth = sanitizeTextField(formData.place_of_birth);
    const genderVal = formData.gender === 'N' ? 'N' : null;
    const fac = sanitizeTextField(formData.faculty);
    const maj = sanitizeTextField(formData.major);
    const spec = sanitizeTextField(formData.specialization);
    const cpaVal = formData.cpa.trim();

    // Tự động suy luận xếp loại nếu chưa có nhưng có CPA
    const classif = formData.classification || getAutoClassification(cpaVal);

    const degNum = sanitizeTextField(formData.degree_number);
    const regNum = sanitizeTextField(formData.register_number);
    const natId = sanitizeTextField(formData.national_id);
    const degType = sanitizeTextField(formData.degree_type) || "Cử nhân (Bachelor's Degree)";
    const emailVal = sanitizeTextField(formData.university_email);
    const modeStudy = sanitizeTextField(formData.mode_of_study);

    // 1. Check required mandatory fields
    if (!sId || !fName || !dobVal || !cId) {
      showToast('error', t('errFillAllFields') || 'Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    // 2. Strict format validations
    // MSSV / Mã SV: 2 - 15 ký tự (Chữ, số, -, _)
    if (!CODE_KEY_REGEX.test(sId)) {
      showToast('error', t('errInvalidStudentId') ? t('errInvalidStudentId').replace('{val}', sId) : 'Mã SV không hợp lệ (2-15 ký tự chữ, số, -, _)');
      return;
    }

    // Full Name: 2-200 chars, no special characters (@, #, $, %, etc.)
    if (fName.length < 2 || fName.length > 200 || !isValidGeneralText(fName, 2, 200)) {
      showToast('error', t('errInvalidFullname') || 'Họ và tên không hợp lệ (2-200 ký tự, không chứa ký tự đặc biệt)');
      return;
    }

    // DOB: dd/mm/yyyy
    if (!isValidDateDDMMYYYY(dobVal)) {
      showToast('error', t('errFormatDobDetail') ? t('errFormatDobDetail').replace('{val}', dobVal) : 'Ngày sinh không hợp lệ');
      return;
    }

    // Class ID / Lớp: 2-15 chars (Chữ, số, -, _)
    if (!CODE_KEY_REGEX.test(cId)) {
      showToast('error', t('errInvalidClassId') ? t('errInvalidClassId').replace('{val}', cId) : 'Mã lớp không hợp lệ (2-15 ký tự)');
      return;
    }

    // CPA decimal check if provided
    if (cpaVal && !isValidDecimalNumber(cpaVal)) {
      showToast('error', t('errInvalidCpa') || 'Điểm CPA phải là số thập phân');
      return;
    }

    // Graduation Year range check if entered
    const maxYearAllowed = new Date().getFullYear() + 3;
    if (formData.graduation_year.trim()) {
      const gYr = parseInt(formData.graduation_year.trim(), 10);
      if (isNaN(gYr) || gYr < 1930 || gYr > maxYearAllowed) {
        showToast('error', `Năm tốt nghiệp không hợp lệ (phải từ 1930 đến ${maxYearAllowed})`);
        return;
      }
    }

    // Optional text fields format check
    const textCheckList: [string, string][] = [
      ['Nơi sinh', placeBirth],
      ['Khoa / Viện', fac],
      ['Ngành học', maj],
      ['Chuyên ngành', spec],
      ['Số hiệu bằng', degNum],
      ['Số vào sổ gốc', regNum],
    ];

    for (const [label, val] of textCheckList) {
      if (val && !isValidGeneralText(val, 2, 300)) {
        showToast('error', `${label} không hợp lệ (chỉ chấp nhận chữ, số, -, / và không chứa ký tự đặc biệt @, #, $,...)`);
        return;
      }
    }

    // Auto calculate graduation year from class code or input
    const gradYearNum = extractGraduationYear(cId, formData.graduation_year);

    setIsSubmitting(true);
    try {
      const payload: ImportManualCredentialPayload = {
        student_id: sId,
        full_name: fName,
        dob: dobVal,
        class_id: cId,
        graduation_year: gradYearNum,
        university_email: emailVal || undefined,
        major: maj || undefined,
        classification: classif || undefined,
        mode_of_study: modeStudy || undefined,
        national_id: natId || undefined,
        place_of_birth: placeBirth || undefined,
        gender: genderVal,
        faculty: fac || undefined,
        specialization: spec || undefined,
        cpa: cpaVal || undefined,
        degree_number: degNum || undefined,
        register_number: regNum || undefined,
        degree_type: degType,
        overwrite: !!formData.overwrite,
      };

      const response = await importManualCredentialApi(payload);

      if (response.success) {
        showToast(
          'success',
          response.message ||
          (response.data?.action === 'updated'
            ? t('manualUpdateSuccess') || 'Cập nhật thành công'
            : t('manualCreateSuccess') || 'Thêm thành công')
        );
        handleReset();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        showToast('error', response.message || t('manualAddFailed') || 'Thêm thất bại');
      }
    } catch (err: any) {
      const apiErrCode = err?.response?.data?.error_code;
      const apiErrMessage = err?.response?.data?.message || err?.message || t('manualAddFailed');

      if (apiErrCode === 'CREDENTIAL_ALREADY_EXISTS') {
        showToast('error', t('credentialAlreadyExistsMsg') || 'Dữ liệu đã tồn tại');
      } else {
        showToast('error', apiErrMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl w-[94vw] max-h-[92vh] flex flex-col p-6 sm:p-7 gap-5 overflow-hidden">
        <DialogHeader className="shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold">
            <UserPlus className="w-6 h-6 text-primary" />
            {t('addManualCredentialTitle') || 'Nhập thủ công 1 bằng cấp'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1">
            {t('addManualCredentialDesc') || 'Điền đầy đủ các thông tin chi tiết dưới đây.'}
          </DialogDescription>
        </DialogHeader>

        <form id="manual-import-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-7">
          {/* Nhóm 1: Thông tin cá nhân */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-1.5">
              I. Nhóm Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* MSSV */}
              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-sm font-semibold">
                  Mã SV / MSSV <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student_id"
                  placeholder="VD: 20110345"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                  required
                />
              </div>

              {/* Họ và Tên */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-semibold">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                  required
                />
              </div>

              {/* Ngày sinh với Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-semibold">
                  Ngày sinh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                  required
                />
              </div>

              {/* Nơi sinh chọn từ danh sách 63 Tỉnh/Thành */}
              <div className="space-y-2">
                <Label htmlFor="place_of_birth" className="text-sm font-semibold">Nơi sinh</Label>
                <SearchCombobox
                  id="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={(val) => handleChange('place_of_birth', val)}
                  options={VIETNAM_PROVINCES.map((p) => ({ label: p, value: p }))}
                  placeholder="Chọn Tỉnh / Thành phố"
                  searchPlaceholder="Tìm Tỉnh / Thành phố..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Giới tính */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Giới tính</Label>
                <RadioGroup
                  value={formData.gender || 'NAM'}
                  onValueChange={(val) => handleChange('gender', val === 'N' ? 'N' : '')}
                  disabled={isSubmitting}
                  className="flex items-center space-x-5 pt-1.5"
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="NAM" id="gender-nam" />
                    <Label htmlFor="gender-nam" className="text-sm cursor-pointer font-medium">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="N" id="gender-nu" />
                    <Label htmlFor="gender-nu" className="text-sm cursor-pointer font-medium">Nữ</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* CCCD */}
              <div className="space-y-2">
                <Label htmlFor="national_id" className="text-sm font-semibold">Căn cước công dân</Label>
                <Input
                  id="national_id"
                  placeholder="VD: 079202012345"
                  value={formData.national_id}
                  onChange={(e) => handleChange('national_id', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* University Email */}
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="university_email" className="text-sm font-semibold">Email trường</Label>
                <Input
                  id="university_email"
                  type="email"
                  placeholder="VD: an.nv20110345@student.ctu.edu.vn"
                  value={formData.university_email}
                  onChange={(e) => handleChange('university_email', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thông tin học vụ */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-1.5">
              II. Nhóm Thông tin học vụ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="class_id" className="text-sm font-semibold">
                  Lớp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="class_id"
                  placeholder="VD: SP2201A1"
                  value={formData.class_id}
                  onChange={(e) => handleChange('class_id', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                  required
                />
              </div>

              {/* Khoa / Viện */}
              <div className="space-y-2">
                <Label htmlFor="faculty" className="text-sm font-semibold">Khoa / Viện</Label>
                <Input
                  id="faculty"
                  placeholder="VD: Công nghệ Thông tin"
                  value={formData.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Ngành học */}
              <div className="space-y-2">
                <Label htmlFor="major" className="text-sm font-semibold">Ngành học</Label>
                <Input
                  id="major"
                  placeholder="VD: Kỹ thuật Phần mềm"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Chuyên ngành */}
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-semibold">Chuyên ngành</Label>
                <Input
                  id="specialization"
                  placeholder="VD: Trí tuệ Nhân tạo"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Hình thức đào tạo / Mode of study */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mode_of_study" className="text-sm font-semibold">Hình thức đào tạo</Label>
                <Select
                  value={formData.mode_of_study}
                  onValueChange={(val) => handleChange('mode_of_study', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="mode_of_study" className="w-full h-10 text-sm">
                    <SelectValue placeholder="Chọn Hình thức đào tạo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_OF_STUDY_OPTIONS.map((mode) => (
                      <SelectItem key={mode} value={mode} className="text-sm">
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Kết quả & Cấp bằng */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-1.5">
              III. Nhóm Kết quả & Cấp bằng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* CPA */}
              <div className="space-y-2">
                <Label htmlFor="cpa" className="text-sm font-semibold">Điểm TBC (CPA)</Label>
                <Input
                  id="cpa"
                  placeholder="VD: 3.45"
                  value={formData.cpa}
                  onChange={(e) => handleChange('cpa', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Xếp loại tốt nghiệp (tự động suy luận từ CPA & đọc chỉ) */}
              <div className="space-y-2">
                <Label htmlFor="classification" className="text-sm font-semibold">Xếp loại tốt nghiệp (Tự động)</Label>
                <Input
                  id="classification"
                  value={formData.classification || (formData.cpa ? getAutoClassification(formData.cpa) : '')}
                  readOnly
                  disabled
                  placeholder="Tự động từ CPA"
                  className="h-10 text-sm bg-muted font-medium text-foreground cursor-not-allowed"
                />
              </div>

              {/* Số hiệu bằng */}
              <div className="space-y-2">
                <Label htmlFor="degree_number" className="text-sm font-semibold">Số hiệu bằng</Label>
                <Input
                  id="degree_number"
                  placeholder="VD: 012345"
                  value={formData.degree_number}
                  onChange={(e) => handleChange('degree_number', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Số vào sổ gốc */}
              <div className="space-y-2">
                <Label htmlFor="register_number" className="text-sm font-semibold">Số vào sổ gốc</Label>
                <Input
                  id="register_number"
                  placeholder="VD: 152/2026/QĐ-ĐHCT"
                  value={formData.register_number}
                  onChange={(e) => handleChange('register_number', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>

              {/* Loại bằng / Loại chứng chỉ từ list quy định */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="degree_type" className="text-sm font-semibold">Loại bằng / Loại chứng chỉ</Label>
                <SearchCombobox
                  id="degree_type"
                  value={formData.degree_type}
                  onChange={(val) => handleChange('degree_type', val)}
                  options={DEGREE_TYPES.map((d) => ({
                    label: d.label,
                    value: d.label,
                    group: d.category,
                  }))}
                  placeholder="Chọn Loại bằng / Chứng chỉ"
                  searchPlaceholder="Tìm Loại bằng / Chứng chỉ..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Năm tốt nghiệp mặc định năm hiện tại */}
              <div className="space-y-2">
                <Label htmlFor="graduation_year" className="text-sm font-semibold">Năm tốt nghiệp</Label>
                <Input
                  id="graduation_year"
                  placeholder="VD: 2026"
                  value={formData.graduation_year}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Ghi đè tùy chọn */}
          <div className="pt-3 border-t flex items-center space-x-2.5">
            <Checkbox
              id="manual-overwrite"
              checked={formData.overwrite}
              onCheckedChange={(checked) => handleChange('overwrite', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="manual-overwrite" className="text-sm font-medium leading-none cursor-pointer">
              {t('manualOverwriteDesc') || 'Cho phép ghi đè nếu dữ liệu đã tồn tại'}
            </Label>
          </div>
        </form>

        <DialogFooter className="shrink-0 flex flex-row justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="h-10 text-sm">
            {t('cancel')}
          </Button>
          <Button type="submit" form="manual-import-form" disabled={isSubmitting} className="min-w-[120px] h-10 text-sm font-semibold">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('submitManualCredential') || 'Nhập bằng cấp'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
