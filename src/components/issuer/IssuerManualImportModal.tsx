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

    // Client-side validation: All fields are required
    if (!formData.student_id.trim()) {
      showToast('error', t('errStudentIdRequired'));
      return;
    }
    if (!formData.full_name.trim()) {
      showToast('error', t('errFullNameRequired'));
      return;
    }
    if (!formData.dob.trim()) {
      showToast('error', t('errDobRequired'));
      return;
    }
    if (!formData.graduation_year || formData.graduation_year < 1900) {
      showToast('error', t('errGradYearRequired'));
      return;
    }
    if (!formData.university_email.trim()) {
      showToast('error', t('errUniversityEmailRequired'));
      return;
    }
    if (!formData.major_vi?.trim() ||
        !formData.major_en?.trim() ||
        !formData.graduation_classification_vi?.trim() ||
        !formData.graduation_classification_en?.trim() ||
        !formData.mode_of_study_vi?.trim() ||
        !formData.mode_of_study_en?.trim() ||
        !formData.class_id?.trim() ||
        !formData.national_id_hash?.trim() ||
        !formData.phone?.trim()) {
      showToast('error', t('errFillAllFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ImportManualCredentialPayload = {
        student_id: formData.student_id.trim(),
        full_name: formData.full_name.trim(),
        dob: formData.dob.trim(),
        graduation_year: Number(formData.graduation_year),
        university_email: formData.university_email.trim(),
        major_vi: formData.major_vi.trim(),
        major_en: formData.major_en.trim(),
        graduation_classification_vi: formData.graduation_classification_vi.trim(),
        graduation_classification_en: formData.graduation_classification_en.trim(),
        mode_of_study_vi: formData.mode_of_study_vi.trim(),
        mode_of_study_en: formData.mode_of_study_en.trim(),
        class_id: formData.class_id.trim(),
        national_id_hash: formData.national_id_hash.trim(),
        phone: formData.phone.trim(),
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
