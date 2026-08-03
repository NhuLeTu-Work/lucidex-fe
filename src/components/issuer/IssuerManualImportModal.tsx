import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { UserPlus, Loader2 } from 'lucide-react';

interface IssuerManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData: ImportManualCredentialPayload = {
  student_id: '',
  full_name: '',
  dob: '',
  graduation_year: new Date().getFullYear(),
  university_email: '',
  major_vi: '',
  major_en: '',
  graduation_classification_vi: '',
  graduation_classification_en: '',
  mode_of_study_vi: '',
  mode_of_study_en: '',
  class_id: '',
  national_id_hash: '',
  phone: '',
  overwrite: false,
};

// Regex constants matching CSV validation standards
const STUDENT_ID_REGEX = /^[a-zA-Z0-9]{2,15}$/;
const CLASS_ID_REGEX = /^[a-zA-Z0-9]{2,15}$/;
const NO_NUMBERS_OR_SPECIAL_REGEX = /^[\p{L}\s]+$/u;
const NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX = /^[\p{L}\s-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NATIONAL_ID_REGEX = /^\d{12}$/;
const PHONE_REGEX = /^[0-9+\s-]{8,15}$/;

function isValidDateString(dateStr: string): boolean {
  if (!dateStr.trim()) return false;
  // Support YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [y, m, d] = dateStr.trim().split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }
  // Support DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr.trim())) {
    const [d, m, y] = dateStr.trim().split('/').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }
  return false;
}

export function IssuerManualImportModal({
  isOpen,
  onClose,
  onSuccess,
}: IssuerManualImportModalProps) {
  const { t, showToast } = useApp();
  const [formData, setFormData] = useState<ImportManualCredentialPayload>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ImportManualCredentialPayload, value: any) => {
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

    // 1. Required check for all fields
    const sId = formData.student_id.trim();
    const fName = formData.full_name.trim();
    const dobVal = formData.dob.trim();
    const gYear = Number(formData.graduation_year);
    const emailVal = formData.university_email.trim();
    const mVi = formData.major_vi?.trim() || '';
    const mEn = formData.major_en?.trim() || '';
    const gcVi = formData.graduation_classification_vi?.trim() || '';
    const gcEn = formData.graduation_classification_en?.trim() || '';
    const msVi = formData.mode_of_study_vi?.trim() || '';
    const msEn = formData.mode_of_study_en?.trim() || '';
    const cId = formData.class_id?.trim() || '';
    const nId = formData.national_id_hash?.trim() || '';
    const phoneVal = formData.phone?.trim() || '';

    if (!sId || !fName || !dobVal || !gYear || !emailVal ||
        !mVi || !mEn || !gcVi || !gcEn || !msVi || !msEn ||
        !cId || !nId || !phoneVal) {
      showToast('error', t('errFillAllFields'));
      return;
    }

    // 2. Strict format validations matching CSV Upload standards

    // Student ID: 2-15 letters + numbers
    if (!STUDENT_ID_REGEX.test(sId)) {
      showToast('error', t('errInvalidStudentId').replace('{val}', sId));
      return;
    }

    // Full Name: 2-200 chars, no numbers or special chars
    if (fName.length < 2 || fName.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(fName)) {
      showToast('error', t('errInvalidFullname'));
      return;
    }

    // DOB: valid YYYY-MM-DD or DD/MM/YYYY
    if (!isValidDateString(dobVal)) {
      showToast('error', t('errFormatDobDetail').replace('{val}', dobVal));
      return;
    }

    // Graduation Year: >= 1970
    if (isNaN(gYear) || gYear < 1970) {
      showToast('error', t('errInvalidGradYear').replace('{val}', String(formData.graduation_year)));
      return;
    }

    // Email
    if (!EMAIL_REGEX.test(emailVal)) {
      showToast('error', t('errInvalidEmail').replace('{val}', emailVal));
      return;
    }

    // Major VI: 2-200 chars, no numbers/special
    if (mVi.length < 2 || mVi.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(mVi)) {
      showToast('error', t('errInvalidViMajor'));
      return;
    }

    // Major EN: 2-200 chars, no numbers/special
    if (mEn.length < 2 || mEn.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(mEn)) {
      showToast('error', t('errInvalidEnMajor'));
      return;
    }

    // Graduation Classification VI: 2-200 chars, no numbers/special
    if (gcVi.length < 2 || gcVi.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(gcVi)) {
      showToast('error', t('errInvalidViGradClass'));
      return;
    }

    // Graduation Classification EN: 2-200 chars, no numbers/special
    if (gcEn.length < 2 || gcEn.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(gcEn)) {
      showToast('error', t('errInvalidEnGradClass'));
      return;
    }

    // Mode of Study VI: 2-200 chars, allow hyphens
    if (msVi.length < 2 || msVi.length > 200 || !NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX.test(msVi)) {
      showToast('error', t('errInvalidViMode'));
      return;
    }

    // Mode of Study EN: 2-200 chars, allow hyphens
    if (msEn.length < 2 || msEn.length > 200 || !NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX.test(msEn)) {
      showToast('error', t('errInvalidEnMode'));
      return;
    }

    // Class ID: 2-15 letters + numbers
    if (!CLASS_ID_REGEX.test(cId)) {
      showToast('error', t('errInvalidClassId').replace('{val}', cId));
      return;
    }

    // National ID: 12 digits
    if (!NATIONAL_ID_REGEX.test(nId)) {
      showToast('error', t('errInvalidNationalIdDetail').replace('{val}', nId));
      return;
    }

    // Phone: valid phone digits
    if (!PHONE_REGEX.test(phoneVal)) {
      showToast('error', t('errInvalidPhone').replace('{val}', phoneVal));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ImportManualCredentialPayload = {
        student_id: sId,
        full_name: fName,
        dob: dobVal,
        graduation_year: gYear,
        university_email: emailVal,
        major_vi: mVi,
        major_en: mEn,
        graduation_classification_vi: gcVi,
        graduation_classification_en: gcEn,
        mode_of_study_vi: msVi,
        mode_of_study_en: msEn,
        class_id: cId,
        national_id_hash: nId,
        phone: phoneVal,
        overwrite: !!formData.overwrite,
      };

      const response = await importManualCredentialApi(payload);

      if (response.success) {
        showToast(
          'success',
          response.message ||
            (response.data?.action === 'updated'
              ? t('manualUpdateSuccess')
              : t('manualCreateSuccess'))
        );
        handleReset();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        showToast('error', response.message || t('manualAddFailed'));
      }
    } catch (err: any) {
      const apiErrCode = err?.response?.data?.error_code;
      const apiErrMessage = err?.response?.data?.message || err?.message || t('manualAddFailed');

      if (apiErrCode === 'CREDENTIAL_ALREADY_EXISTS') {
        showToast('error', t('credentialAlreadyExistsMsg'));
      } else {
        showToast('error', apiErrMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl w-[92vw] max-h-[90vh] flex flex-col p-6 gap-4 overflow-hidden">
        <DialogHeader className="shrink-0 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            {t('addManualCredentialTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('addManualCredentialDesc')}
          </DialogDescription>
        </DialogHeader>

        <form id="manual-import-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t('credentialInfo')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* MSSV */}
              <div className="space-y-1.5">
                <Label htmlFor="student_id" className="text-xs font-medium">
                  {t('studentIdLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student_id"
                  placeholder="VD: SV21110001"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-medium">
                  {t('fullNameLabel')} <span className="text-destructive">*</span>
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

              {/* DOB */}
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-medium">
                  {t('dobLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-1.5">
                <Label htmlFor="graduation_year" className="text-xs font-medium">
                  {t('graduationYearLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="graduation_year"
                  type="number"
                  placeholder="VD: 2025"
                  value={formData.graduation_year}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="university_email" className="text-xs font-medium">
                  {t('universityEmailLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="university_email"
                  type="email"
                  placeholder="VD: an.nv21110001@student.edu.vn"
                  value={formData.university_email}
                  onChange={(e) => handleChange('university_email', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Major VI */}
              <div className="space-y-1.5">
                <Label htmlFor="major_vi" className="text-xs font-medium">
                  {t('majorViLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="major_vi"
                  placeholder="VD: Khoa học máy tính"
                  value={formData.major_vi}
                  onChange={(e) => handleChange('major_vi', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Major EN */}
              <div className="space-y-1.5">
                <Label htmlFor="major_en" className="text-xs font-medium">
                  {t('majorEnLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="major_en"
                  placeholder="VD: Computer Science"
                  value={formData.major_en}
                  onChange={(e) => handleChange('major_en', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Classification VI */}
              <div className="space-y-1.5">
                <Label htmlFor="graduation_classification_vi" className="text-xs font-medium">
                  {t('gradClassViLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="graduation_classification_vi"
                  placeholder="VD: Giỏi, Xuất sắc, Khá"
                  value={formData.graduation_classification_vi}
                  onChange={(e) => handleChange('graduation_classification_vi', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Classification EN */}
              <div className="space-y-1.5">
                <Label htmlFor="graduation_classification_en" className="text-xs font-medium">
                  {t('gradClassEnLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="graduation_classification_en"
                  placeholder="VD: Good, Excellent, Fair"
                  value={formData.graduation_classification_en}
                  onChange={(e) => handleChange('graduation_classification_en', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Mode of Study VI */}
              <div className="space-y-1.5">
                <Label htmlFor="mode_of_study_vi" className="text-xs font-medium">
                  {t('modeStudyViLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mode_of_study_vi"
                  placeholder="VD: Chính quy, Vừa học vừa làm"
                  value={formData.mode_of_study_vi}
                  onChange={(e) => handleChange('mode_of_study_vi', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Mode of Study EN */}
              <div className="space-y-1.5">
                <Label htmlFor="mode_of_study_en" className="text-xs font-medium">
                  {t('modeStudyEnLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mode_of_study_en"
                  placeholder="VD: Full-time, Part-time"
                  value={formData.mode_of_study_en}
                  onChange={(e) => handleChange('mode_of_study_en', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Class ID */}
              <div className="space-y-1.5">
                <Label htmlFor="class_id" className="text-xs font-medium">
                  {t('classIdLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="class_id"
                  placeholder="VD: 21KMT1"
                  value={formData.class_id}
                  onChange={(e) => handleChange('class_id', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* National ID */}
              <div className="space-y-1.5">
                <Label htmlFor="national_id_hash" className="text-xs font-medium">
                  {t('nationalIdLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="national_id_hash"
                  placeholder="VD: 079203012345"
                  value={formData.national_id_hash}
                  onChange={(e) => handleChange('national_id_hash', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="phone" className="text-xs font-medium">
                  {t('phoneLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="VD: 0912345678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isSubmitting}
                  required
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
              {t('manualOverwriteDesc')}
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
              t('submitManualCredential')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
