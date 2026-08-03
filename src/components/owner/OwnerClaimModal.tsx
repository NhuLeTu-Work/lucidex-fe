import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { useClaimCredential } from '@/hooks/owner/useClaimCredential';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, Loader2, X } from 'lucide-react';
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
  const { t, showToast } = useApp();
  const { claimSingleCredential } = useClaimCredential();

  const [claimingIds, setClaimingIds] = useState<Record<string, boolean>>({});
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-3xl w-[90vw] sm:rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden"
        style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
      >
        <DialogHeader className="pb-3 border-b shrink-0 flex flex-row items-center justify-between" style={{ borderColor: 'var(--ct-border)' }}>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{t('claimCredentialsTitle') || 'Danh sách Văn bằng Chờ Nhận'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1 space-y-4">
          {unclaimedItems.length === 0 ? (
            <div className="py-8 text-center space-y-2" style={{ color: 'var(--ct-text-secondary)' }}>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto opacity-80" />
              <p className="font-medium text-base">{t('noUnclaimedCredentials') || 'Không có văn bằng nào cần nhận.'}</p>
            </div>
          ) : (
            unclaimedItems.map((item) => {
              const isClaiming = !!claimingIds[item.id];
              const isClaimed = !!claimedIds[item.id] || item.status === 'claimed';
              const canClaim = item.can_claim !== false;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-muted/10"
                  style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">{item.full_name}</h4>
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs" style={{ color: 'var(--ct-text-secondary)' }}>
                      <div>
                        <span className="font-semibold">{t('studentId') || 'Mã SV'}: </span>
                        <span>{item.student_id}</span>
                      </div>
                      {item.class_id && (
                        <div>
                          <span className="font-semibold">{t('classId') || 'Lớp'}: </span>
                          <span>{item.class_id}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">{t('gradYear') || 'Năm TN'}: </span>
                        <span>{item.graduation_year}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {isClaimed ? (
                      <Button variant="outline" disabled className="border-green-200 text-green-700 gap-1.5">
                        <CheckCircle2 size={16} />
                        <span>{t('claimed') || 'Đã Nhận'}</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleClaimItem(item)}
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
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-3 border-t shrink-0 flex items-center justify-end" style={{ borderColor: 'var(--ct-border)' }}>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X size={16} />
            {t('cancelBtn') || 'Đóng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
