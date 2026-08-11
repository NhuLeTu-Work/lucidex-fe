import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { UserPlus, Loader2 } from 'lucide-react';

interface IssuerManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData = {
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
  graduation_year: '',
  mode_of_study: '',
  university_email: '',
  overwrite: false,
};

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
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
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
    const classif = sanitizeTextField(formData.classification);
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
        cpa: cpaVal ? Number(cpaVal) : null,
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

  const vanBangOptions = DEGREE_TYPES.filter((d) => d.category === 'Văn bằng');
  const chungChiOptions = DEGREE_TYPES.filter((d) => d.category === 'Chứng chỉ');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl w-[94vw] max-h-[90vh] flex flex-col p-6 gap-4 overflow-hidden">
        <DialogHeader className="shrink-0 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            {t('addManualCredentialTitle') || 'Nhập thủ công 1 bằng cấp'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('addManualCredentialDesc') || 'Điền đầy đủ các thông tin chi tiết dưới đây.'}
          </DialogDescription>
        </DialogHeader>

        <form id="manual-import-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Nhóm 1: Thông tin cá nhân */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b pb-1">
              I. Nhóm Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* MSSV */}
              <div className="space-y-1.5">
                <Label htmlFor="student_id" className="text-xs font-medium">
                  Mã SV / MSSV <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student_id"
                  placeholder="VD: 20110345"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Họ và Tên */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-medium">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Ngày sinh với Date Picker */}
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-medium">
                  Ngày sinh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Nơi sinh chọn từ danh sách 63 Tỉnh/Thành */}
              <div className="space-y-1.5">
                <Label htmlFor="place_of_birth" className="text-xs font-medium">Nơi sinh</Label>
                <Select
                  value={formData.place_of_birth}
                  onValueChange={(val) => handleChange('place_of_birth', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="place_of_birth" className="w-full">
                    <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {VIETNAM_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Giới tính */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Giới tính</Label>
                <RadioGroup
                  value={formData.gender || 'NAM'}
                  onValueChange={(val) => handleChange('gender', val === 'N' ? 'N' : '')}
                  disabled={isSubmitting}
                  className="flex items-center space-x-4 pt-1"
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="NAM" id="gender-nam" />
                    <Label htmlFor="gender-nam" className="text-xs cursor-pointer">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="N" id="gender-nu" />
                    <Label htmlFor="gender-nu" className="text-xs cursor-pointer">Nữ</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* CCCD */}
              <div className="space-y-1.5">
                <Label htmlFor="national_id" className="text-xs font-medium">Căn cước công dân</Label>
                <Input
                  id="national_id"
                  placeholder="VD: 079202012345"
                  value={formData.national_id}
                  onChange={(e) => handleChange('national_id', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* University Email */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="university_email" className="text-xs font-medium">Email trường</Label>
                <Input
                  id="university_email"
                  type="email"
                  placeholder="VD: an.nv20110345@student.ctu.edu.vn"
                  value={formData.university_email}
                  onChange={(e) => handleChange('university_email', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thông tin học vụ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b pb-1">
              II. Nhóm Thông tin học vụ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lớp / Khóa */}
              <div className="space-y-1.5">
                <Label htmlFor="class_id" className="text-xs font-medium">
                  Lớp / Khóa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="class_id"
                  placeholder="VD: IT1-K62"
                  value={formData.class_id}
                  onChange={(e) => handleChange('class_id', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Khoa / Viện */}
              <div className="space-y-1.5">
                <Label htmlFor="faculty" className="text-xs font-medium">Khoa / Viện</Label>
                <Input
                  id="faculty"
                  placeholder="VD: Công nghệ Thông tin"
                  value={formData.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Ngành học */}
              <div className="space-y-1.5">
                <Label htmlFor="major" className="text-xs font-medium">Ngành học</Label>
                <Input
                  id="major"
                  placeholder="VD: Kỹ thuật Phần mềm"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Chuyên ngành */}
              <div className="space-y-1.5">
                <Label htmlFor="specialization" className="text-xs font-medium">Chuyên ngành</Label>
                <Input
                  id="specialization"
                  placeholder="VD: Trí tuệ Nhân tạo"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Hình thức đào tạo / Mode of study */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="mode_of_study" className="text-xs font-medium">Hình thức đào tạo</Label>
                <Select
                  value={formData.mode_of_study}
                  onValueChange={(val) => handleChange('mode_of_study', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="mode_of_study" className="w-full">
                    <SelectValue placeholder="Chọn Hình thức đào tạo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_OF_STUDY_OPTIONS.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Kết quả & Cấp bằng */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b pb-1">
              III. Nhóm Kết quả & Cấp bằng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* CPA */}
              <div className="space-y-1.5">
                <Label htmlFor="cpa" className="text-xs font-medium">Điểm TBC (CPA)</Label>
                <Input
                  id="cpa"
                  placeholder="VD: 3.45"
                  value={formData.cpa}
                  onChange={(e) => handleChange('cpa', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Xếp loại tốt nghiệp với Select dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="classification" className="text-xs font-medium">Xếp loại tốt nghiệp</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(val) => handleChange('classification', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="classification" className="w-full">
                    <SelectValue placeholder="Chọn xếp loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Xuất sắc">Xuất sắc</SelectItem>
                    <SelectItem value="Giỏi">Giỏi</SelectItem>
                    <SelectItem value="Khá">Khá</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Số hiệu bằng */}
              <div className="space-y-1.5">
                <Label htmlFor="degree_number" className="text-xs font-medium">Số hiệu bằng</Label>
                <Input
                  id="degree_number"
                  placeholder="VD: 012345"
                  value={formData.degree_number}
                  onChange={(e) => handleChange('degree_number', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Số vào sổ gốc */}
              <div className="space-y-1.5">
                <Label htmlFor="register_number" className="text-xs font-medium">Số vào sổ gốc</Label>
                <Input
                  id="register_number"
                  placeholder="VD: 152/2026/QĐ-ĐHCT"
                  value={formData.register_number}
                  onChange={(e) => handleChange('register_number', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Loại bằng / Loại chứng chỉ từ list quy định */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="degree_type" className="text-xs font-medium">Loại bằng / Loại chứng chỉ</Label>
                <Select
                  value={formData.degree_type}
                  onValueChange={(val) => handleChange('degree_type', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="degree_type" className="w-full">
                    <SelectValue placeholder="Chọn Loại bằng / Chứng chỉ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectGroup>
                      <SelectLabel className="font-semibold text-primary">Văn bằng</SelectLabel>
                      {vanBangOptions.map((item) => (
                        <SelectItem key={item.label} value={item.label}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup className="mt-2">
                      <SelectLabel className="font-semibold text-primary">Chứng chỉ</SelectLabel>
                      {chungChiOptions.map((item) => (
                        <SelectItem key={item.label} value={item.label}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Năm tốt nghiệp */}
              <div className="space-y-1.5">
                <Label htmlFor="graduation_year" className="text-xs font-medium">Năm tốt nghiệp</Label>
                <Input
                  id="graduation_year"
                  placeholder="Tự trích xuất từ lớp hoặc nhập (VD: 2026)"
                  value={formData.graduation_year}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Ghi đè tùy chọn */}
          <div className="pt-2 border-t flex items-center space-x-2">
            <Checkbox
              id="manual-overwrite"
              checked={formData.overwrite}
              onCheckedChange={(checked) => handleChange('overwrite', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="manual-overwrite" className="text-xs font-medium leading-none cursor-pointer">
              {t('manualOverwriteDesc') || 'Cho phép ghi đè nếu dữ liệu đã tồn tại'}
            </Label>
          </div>
        </form>

        <DialogFooter className="shrink-0 flex flex-row justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="manual-import-form" disabled={isSubmitting} className="min-w-[110px]">
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
