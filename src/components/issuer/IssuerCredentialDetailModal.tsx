import { useApp } from '../../app/AppContext';
import { useCredentialDetail } from '@/hooks/issuer/useCredentialDetail';
import { formatDateDDMMYYYY, timeUtil } from '@/utils/timeUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { X, Edit2, Trash2 } from 'lucide-react';

interface CredentialDetailModalProps {
  id: string | null;
  onClose: () => void;
}

export function IssuerCredentialDetailModal({ id, onClose }: CredentialDetailModalProps) {
  const { t, lang, showToast } = useApp();
  const { data, isLoading } = useCredentialDetail(id);

  if (!id) return null;

  const isClaimed = data?.status === 'claimed';
  const major = data ? (lang === 'vi' ? data.major_vi : data.major_en || data.major_vi) : '—';
  const classification = data ? (lang === 'vi' ? data.graduation_classification_vi : data.graduation_classification_en || data.graduation_classification_vi) : '—';
  const modeOfStudy = data ? (lang === 'vi' ? data.mode_of_study_vi : data.mode_of_study_en || data.mode_of_study_vi) : '—';

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-4xl w-[90vw] sm:rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden"
        style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
      >
        <DialogHeader className="pb-3 border-b shrink-0" style={{ borderColor: 'var(--ct-border)' }}>
          <DialogTitle className="font-display text-xl">
            {t('credentialDetailTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-24 bg-muted/20" />
                  <Skeleton className="h-5 w-40 bg-muted/20" />
                </div>
              ))}
            </div>
          ) : !data ? (
            <div className="py-8 text-center" style={{ color: 'var(--ct-text-secondary)' }}>
              {t('noDataFound')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <FieldItem label={t('studentId')} value={data.student_id} />
              <FieldItem label={t('fullName')} value={data.full_name} />
              <FieldItem label={t('classId')} value={data.class_id} />
              <FieldItem label={t('gradYear')} value={data.graduation_year} />
              <FieldItem label={t('dob')} value={formatDateDDMMYYYY(data.dob)} />
              <FieldItem label={t('major')} value={major} />
              <FieldItem label={t('classification')} value={classification} />
              <FieldItem label={t('modeOfStudy')} value={modeOfStudy} />
              <FieldItem label={t('universityEmail')} value={data.university_email} />
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
                  {t('status')}
                </label>
                <div>
                  {isClaimed ? (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">{t('statusClaimed')}</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{t('statusUnclaimed')}</Badge>
                  )}
                </div>
              </div>
              <FieldItem label={t('claimedAt')} value={data.claimed_at ? timeUtil(data.claimed_at) : '—'} />
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t shrink-0 flex flex-row items-center justify-end gap-3" style={{ borderColor: 'var(--ct-border)' }}>
          {/* Đối với credential chưa claim (unclaimed): Hiển thị 2 nút Edit + Delete */}
          {!isClaimed && data && (
            <>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => showToast('warning', t('confirmDeleteTitle') || 'Delete')}
              >
                <Trash2 size={16} />
                {t('deleteBtn')}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => showToast('warning', t('editBtn') || 'Edit')}
              >
                <Edit2 size={16} />
                {t('editBtn')}
              </Button>
            </>
          )}

          {/* Nút Đóng / Hủy */}
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <X size={16} />
            {t('cancelBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
        {label}
      </label>
      <p className="text-sm font-medium">{value ?? '—'}</p>
    </div>
  );
}