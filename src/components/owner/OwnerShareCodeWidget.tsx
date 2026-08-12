import { useState, useMemo } from 'react';
import { Share2, Copy, Check, ShieldCheck, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/app/AppContext';
import { useCreateVerifiedLink } from '@/hooks/owner/useCreateVerifiedLink';

interface OwnerShareCodeWidgetProps {
  credentialId: string;
}

type ConsentType = 'access_number' | 'time_bound' | 'custom';

export function OwnerShareCodeWidget({ credentialId }: OwnerShareCodeWidgetProps) {
  const { t, showToast } = useApp();
  const { generateLinkCode, isSubmitting, createdData } = useCreateVerifiedLink();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Form states for consent settings
  const [consentType, setConsentType] = useState<ConsentType>('access_number');
  const [maxAccessCount, setMaxAccessCount] = useState<number>(5);
  const [expireHours, setExpireHours] = useState<number>(24);

  // Baseline state of the active code settings to detect changes
  const [baselineConfig, setBaselineConfig] = useState<{
    consentType: ConsentType;
    maxAccessCount: number | null;
    expireHours: number | null;
  } | null>(null);

  // Tính toán thời gian hết hạn dạng ISO 8601 từ số giờ nhập
  const calculatedExpiresAt = useMemo(() => {
    if (consentType === 'access_number') return null;
    if (!expireHours || expireHours <= 0) return null;

    const now = new Date();
    now.setHours(now.getHours() + expireHours);
    return now.toISOString();
  }, [consentType, expireHours]);

  const calculatedAccessCount = useMemo(() => {
    if (consentType === 'time_bound') return null;
    return maxAccessCount > 0 ? maxAccessCount : 1;
  }, [consentType, maxAccessCount]);

  // Kiểm tra người dùng có thay đổi cấu hình consent hay không
  const hasChanges = useMemo(() => {
    if (!baselineConfig) return false;

    if (consentType !== baselineConfig.consentType) return true;

    if (consentType === 'access_number' || consentType === 'custom') {
      if (calculatedAccessCount !== baselineConfig.maxAccessCount) return true;
    }

    if (consentType === 'time_bound' || consentType === 'custom') {
      if (expireHours !== baselineConfig.expireHours) return true;
    }

    return false;
  }, [baselineConfig, consentType, calculatedAccessCount, expireHours]);

  // Khởi tạo/Mở mã chia sẻ khi bấm nút Share
  const handleInitialShareClick = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!createdData) {
      // Gọi API tạo trước theo luồng yêu cầu
      const res = await generateLinkCode({
        credential_id: credentialId,
        expires_at: null,
        allowed_org_ids: [],
        max_access_count: null,
      });

      if (res) {
        const initialType: ConsentType =
          res.consent_mode === 'time_bound'
            ? 'time_bound'
            : res.consent_mode === 'custom'
              ? 'custom'
              : 'access_number';

        const initialAccess = res.max_access_count ?? 5;

        let initialHours = 24;
        if (res.expires_at) {
          const diffHours = Math.round(
            (new Date(res.expires_at).getTime() - new Date().getTime()) / 3600000
          );
          initialHours = diffHours > 0 ? diffHours : 24;
        }

        const initialBaselineCount = initialType === 'time_bound' ? null : initialAccess;
        const initialBaselineHours = initialType === 'access_number' ? null : initialHours;

        setConsentType(initialType);
        setMaxAccessCount(initialAccess);
        setExpireHours(initialHours);

        setBaselineConfig({
          consentType: initialType,
          maxAccessCount: initialBaselineCount,
          expireHours: initialBaselineHours,
        });

        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!createdData?.code) return;
    navigator.clipboard.writeText(createdData.code);
    setIsCopied(true);
    showToast('success', t('codeCopied') || 'Đã sao chép mã chia sẻ!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Lưu cấu hình thay đổi cụ thể cho mã share này
  const handleSaveConsentChanges = async () => {
    const payload = {
      credential_id: credentialId,
      expires_at: calculatedExpiresAt,
      allowed_org_ids: [],
      max_access_count: calculatedAccessCount,
    };

    const res = await generateLinkCode(payload);
    if (res) {
      setBaselineConfig({
        consentType,
        maxAccessCount: consentType === 'time_bound' ? null : calculatedAccessCount,
        expireHours: consentType === 'access_number' ? null : expireHours,
      });
      showToast('success', t('updateSuccess') || 'Đã cập nhật cấu hình mã chia sẻ!');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end">
      {/* Dynamic Popover / Card Panel khi mở */}
      {isOpen && createdData && (
        <Card className="mb-3 w-72 sm:w-80 p-3 gap-2 shadow-2xl border-border bg-card text-card-foreground animate-in slide-in-from-bottom-4 fade-in duration-200 rounded-2xl">
          <div className="flex items-center justify-between mb-2 border-b pb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </div>
              <h4 className="font-bold text-base">{t('shareCodeTitle')}</h4>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-muted/60 dark:bg-muted/30 rounded-lg border border-border">
            <span className="font-mono text-base font-bold tracking-wide text-primary">
              {createdData.code}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="h-7 px-2.5 gap-1.5 text-sm font-semibold"
            >
              {isCopied ? (
                <>
                  <Check size={13} className="text-green-600" />
                  <span>{t('copied') || 'Đã chép'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{t('copy') || 'Sao chép'}</span>
                </>
              )}
            </Button>
          </div>

          {/* Consent Selection Section (3 loại consent) */}
          <div className="space-y-2 border-t pt-2 mt-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">{t('accessConfig')}</Label>
              {createdData.consent_mode && (
                <Badge variant="outline" className="text-xs uppercase font-mono px-1.5 py-0.5">
                  {createdData.consent_mode}
                </Badge>
              )}
            </div>

            {/* Selector 3 loại consent */}
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-muted rounded-lg text-sm font-medium">
              <button
                type="button"
                onClick={() => setConsentType('access_number')}
                className={`py-1 rounded-md transition-all text-center font-medium ${consentType === 'access_number'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('accessNumber')}
              </button>

              <button
                type="button"
                onClick={() => setConsentType('time_bound')}
                className={`py-1 rounded-md transition-all text-center font-medium ${consentType === 'time_bound'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('timeBound')}
              </button>

              <button
                type="button"
                onClick={() => setConsentType('custom')}
                className={`py-1 rounded-md transition-all text-center font-medium ${consentType === 'custom'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('customize')}
              </button>
            </div>

            {/* Chi tiết từng loại Consent (Dạng Inline) */}
            {/* 1. Access Number Input (Inline) */}
            {(consentType === 'access_number' || consentType === 'custom') && (
              <div className="flex items-center justify-between gap-2 text-sm pt-0.5">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t('maxAccessCountLabel')}
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    value={maxAccessCount}
                    onChange={(e) => setMaxAccessCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-7 text-sm font-mono text-center px-1"
                    placeholder="5"
                  />
                  <span className="text-sm text-muted-foreground font-medium">{t('timesUnit')}</span>
                </div>
              </div>
            )}

            {/* 2. Time Bound Input (Inline - Nhập số giờ) */}
            {(consentType === 'time_bound' || consentType === 'custom') && (
              <div className="flex items-center justify-between gap-2 text-sm pt-0.5">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t('expireHoursLabel')}
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    value={expireHours}
                    onChange={(e) => setExpireHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-7 text-sm font-mono text-center px-1"
                    placeholder="24"
                  />
                  <span className="text-sm text-muted-foreground font-medium">{t('hoursUnit')}</span>
                </div>
              </div>
            )}

            {/* Nút LƯU THAY ĐỔI (Chỉ xuất hiện khi người dùng chỉnh sửa consent setting) */}
            {hasChanges && (
              <div className="pt-1.5 animate-in fade-in slide-in-from-top-1">
                <Button
                  onClick={handleSaveConsentChanges}
                  disabled={isSubmitting}
                  className="w-full h-8 text-sm font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-lg"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{t('saveChanges')}</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Floating Trigger Button at Bottom Right */}
      <Button
        onClick={handleInitialShareClick}
        disabled={isSubmitting}
        className="rounded-full shadow-2xl h-12 px-5 font-semibold text-sm bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20"
      >
        {isSubmitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Share2 size={18} />
        )}
        <span>{isOpen ? t('closeShareCode') : t('createShareCode')}</span>
      </Button>
    </div>
  );
}
