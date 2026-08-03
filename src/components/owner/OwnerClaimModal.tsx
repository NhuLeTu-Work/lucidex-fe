import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { useClaimCredential } from '@/hooks/owner/useClaimCredential';
import { useOwnerCredentialDetail } from '@/hooks/owner/useOwnerCredentialDetail';
import { formatDateDDMMYYYY } from '@/utils/timeUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, CheckCircle2, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { OwnerCredentialItem } from '@/api/types/owner.types';

interface OwnerClaimModalProps {
  open: boolean;
  onClose: () => void;
  unclaimedItems: OwnerCredentialItem[];
  onSuccessClaim: () => void;
}

export function OwnerClaimModal({
  open,
  onClose,
  unclaimedItems,
  onSuccessClaim,
}: OwnerClaimModalProps) {
  const { t, lang, showToast } = useApp();
  const { claimSingleCredential } = useClaimCredential();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [claimingIds, setClaimingIds] = useState<Record<string, boolean>>({});
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});

  const safeIndex = Math.min(currentIndex, Math.max(0, unclaimedItems.length - 1));
  const currentItem = unclaimedItems[safeIndex] || null;

  // Lấy thông tin chi tiết đầy đủ của credential hiện tại đang xem
  const { data: detailData, isLoading: isDetailLoading } = useOwnerCredentialDetail(
    open && currentItem ? currentItem.id : null
  );

  const handleClaimItem = async (item: OwnerCredentialItem) => {
    if (claimingIds[item.id] || claimedIds[item.id]) return;

    setClaimingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      const ok = await claimSingleCredential(item.id);
      if (ok) {
        setClaimedIds((prev) => ({ ...prev, [item.id]: true }));
        showToast('success', `${t('claimSuccess') || 'Nhận văn bằng thành công!'} (${item.full_name})`);
        onSuccessClaim();
      }
    } finally {
      setClaimingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const isClaiming = currentItem ? !!claimingIds[currentItem.id] : false;
  const isClaimed = currentItem
    ? !!claimedIds[currentItem.id] || currentItem.status === 'claimed'
    : false;
  const canClaim = currentItem ? currentItem.can_claim !== false : false;

  const major = detailData
    ? lang === 'vi'
      ? detailData.major_vi
      : detailData.major_en || detailData.major_vi
    : currentItem?.full_name || '—';

  const classification = detailData
    ? lang === 'vi'
      ? detailData.graduation_classification_vi
      : detailData.graduation_classification_en || detailData.graduation_classification_vi
    : '—';

  const modeOfStudy = detailData
    ? lang === 'vi'
      ? detailData.mode_of_study_vi
      : detailData.mode_of_study_en || detailData.mode_of_study_vi
    : '—';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-3xl w-[90vw] sm:rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden"
        style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
      >
        <DialogHeader className="pb-3 border-b shrink-0 flex flex-row items-center justify-between" style={{ borderColor: 'var(--ct-border)' }}>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-500" />
            <DialogTitle className="font-display text-xl">
              {t('claimCredentialsTitle') || 'Danh sách Văn bằng Chờ Nhận'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 max-h-[65vh] overflow-y-auto">
          {unclaimedItems.length === 0 || !currentItem ? (
            <div className="py-12 text-center space-y-3" style={{ color: 'var(--ct-text-secondary)' }}>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto opacity-80" />
              <p className="font-medium text-base">{t('noUnclaimedCredentials') || 'Không có văn bằng nào cần nhận.'}</p>
            </div>
          ) : isDetailLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-24 bg-muted/20" />
                  <Skeleton className="h-5 w-40 bg-muted/20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldItem label={t('studentId') || 'Mã SV'} value={detailData?.student_id || currentItem.student_id} />
                <FieldItem label={t('fullName') || 'Họ và tên'} value={detailData?.full_name || currentItem.full_name} />
                <FieldItem label={t('classId') || 'Lớp'} value={detailData?.class_id || currentItem.class_id} />
                <FieldItem label={t('gradYear') || 'Năm tốt nghiệp'} value={detailData?.graduation_year || currentItem.graduation_year} />
                <FieldItem label={t('dob') || 'Ngày sinh'} value={formatDateDDMMYYYY(detailData?.dob)} />
                <FieldItem label={t('major') || 'Chuyên ngành'} value={major} />
                <FieldItem label={t('degreeType') || 'Loại văn bằng'} value={detailData?.degree_type || 'Bằng tốt nghiệp đại học'} />
                <FieldItem label={t('classification') || 'Xếp loại'} value={classification} />
                <FieldItem label={t('modeOfStudy') || 'Hình thức đào tạo'} value={modeOfStudy} />
                <FieldItem label={t('universityEmail') || 'Email trường'} value={detailData?.university_email} />
                <FieldItem label={t('issuer') || 'Đơn vị cấp bằng'} value={detailData?.issuer?.name} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
                    {t('status') || 'Trạng thái'}
                  </label>
                  <div>
                    {isClaimed ? (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        {t('statusClaimed') || 'Đã nhận'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {t('statusUnclaimed') || 'Chưa nhận'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t shrink-0 flex flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--ct-border)' }}>
          {unclaimedItems.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safeIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="gap-1"
              >
                <ChevronLeft size={16} />
                <span>{t('prev') || 'Trước'}</span>
              </Button>

              <span className="text-xs font-medium px-2" style={{ color: 'var(--ct-text-secondary)' }}>
                {safeIndex + 1} / {unclaimedItems.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={safeIndex === unclaimedItems.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(unclaimedItems.length - 1, prev + 1))}
                className="gap-1"
              >
                <span>{t('next') || 'Sau'}</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {currentItem && !isClaimed && (
              <Button
                onClick={() => handleClaimItem(currentItem)}
                disabled={isClaiming || !canClaim}
                variant="default"
                className="gap-2"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>{t('claiming') || 'Đang nhận...'}</span>
                  </>
                ) : (
                  <>
                    <Award size={16} />
                    <span>{t('claimNow') || 'Nhận bằng này'}</span>
                  </>
                )}
              </Button>
            )}

            {currentItem && isClaimed && (
              <Button variant="outline" disabled className="border-green-200 text-green-700 gap-1.5">
                <CheckCircle2 size={16} />
                <span>{t('claimed') || 'Đã Nhận'}</span>
              </Button>
            )}

            <Button variant="outline" onClick={onClose} className="gap-2">
              <X size={16} />
              {t('cancelBtn') || 'Đóng'}
            </Button>
          </div>
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
