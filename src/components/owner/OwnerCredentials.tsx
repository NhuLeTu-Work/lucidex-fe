import { useState } from 'react';
import { CredSnippet } from '../certificates/CredSnippet';
import { CredentialViewer } from '../certificates/CredentialViewer';
import { CredentialCoverReveal } from '../certificates/CredentialCoverReveal';
import GraduationCertificate from '../certificates/ctuGraduation/GraduationCertificate';
import { mapOwnerCredentialToCertificateData } from '../certificates/ctuGraduation/certificateData';
import { useOwnerEkycStatus } from '@/hooks/owner/useOwnerEkycStatus';
import { useOwnerCredentials } from '@/hooks/owner/useOwnerCredentials';
import { useOwnerCredentialDetail } from '@/hooks/owner/useOwnerCredentialDetail';
import { useClaimCredential } from '@/hooks/owner/useClaimCredential';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ArrowRight, Award, Loader2 } from 'lucide-react';
import type { OwnerTab } from '@/types/owner';

interface OwnerCredentialsProps {
  t: (k: string) => string;
  onTabChange?: (tab: OwnerTab) => void;
}

export function OwnerCredentials({ t, onTabChange }: OwnerCredentialsProps) {
  const { isVerified, isLoading: isStatusLoading } = useOwnerEkycStatus();
  const {
    data: credentialsData,
    claimedItems,
    unclaimedItems,
    isLoading: isCredsLoading,
    refetch,
  } = useOwnerCredentials(isVerified);

  const { claimCredentials, isClaiming } = useClaimCredential();

  const [openedCredId, setOpenedCredId] = useState<string | null>(null);
  const { data: detailData, isLoading: isDetailLoading } = useOwnerCredentialDetail(openedCredId);

  if (isStatusLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Case 1: chưa verified eKYC -> Yêu cầu navigate sang tab eKYC
  if (!isVerified) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto text-center">
        <Card className="shadow-sm border-border p-6 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-semibold">{t('ekycRequiredNotice')}</h2>
          </div>
          {onTabChange && (
            <Button
              onClick={() => onTabChange('ekyc')}
              className="mt-4 inline-flex items-center gap-2"
            >
              {t('goToEkycBtn')}
              <ArrowRight size={16} />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Case 2: đã verified eKYC
  const unclaimedCount = credentialsData?.summary?.total_unclaimed ?? unclaimedItems.length;
  const totalClaimedCount = credentialsData?.summary?.total_claimed ?? claimedItems.length;

  const handleClaimClick = async () => {
    // Lọc các credential có thể claim (status = unclaimed & can_claim != false)
    const claimableItems = unclaimedItems.filter((c) => c.can_claim !== false);
    const claimableIds = claimableItems.map((c) => c.id);

    if (claimableIds.length === 0) {
      await refetch();
      return;
    }

    // Gọi API POST /api/v1/owner/claim/credentials/{credential_id} cho các credential chưa claim
    await claimCredentials(claimableIds, async () => {
      // Sau khi claim thành công -> Toast thông báo + Refetch để cập nhật lại danh sách
      await refetch();
    });
  };

  const certificateData = detailData ? mapOwnerCredentialToCertificateData(detailData) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl">{t('myCredentials')}</h1>
          <Badge variant="secondary" className="text-xs">
            {totalClaimedCount}
          </Badge>
        </div>

        {/* Nút "Claim Credentials" */}
        <Button
          onClick={handleClaimClick}
          variant="default"
          className="flex items-center gap-2"
          disabled={isCredsLoading || isClaiming}
        >
          {isClaiming ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Award size={18} />
          )}
          <span>{t('claimCredentialsBtn')}</span>
          {unclaimedCount > 0 ? (
            <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {unclaimedCount} {t('unclaimedBadge') || 'unclaimed'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-1 opacity-70">
              0
            </Badge>
          )}
        </Button>
      </div>

      {isCredsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : claimedItems.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>
          {t('noCredentials')}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {claimedItems.map((cred) => (
            <CredSnippet
              key={cred.id}
              name={cred.full_name ? `${cred.full_name} (${cred.graduation_year})` : 'Graduation Certificate'}
              logoPath="/ctuGraduation/ctuLogo.png"
              onClick={() => setOpenedCredId(cred.id)}
            />
          ))}
        </div>
      )}

      {/* Render Viewer Orchestrator khi click vào snippet */}
      {openedCredId && (
        <CredentialViewer
          onClose={() => setOpenedCredId(null)}
          cover={
            <CredentialCoverReveal
              key={openedCredId}
              logoUrl="/snippet/logoParty.png"
              title="BẰNG TỐT NGHIỆP ĐẠI HỌC"
            />
          }
          content={
            <div className="w-full h-full transform scale-90 md:scale-100 flex items-center justify-center">
              {isDetailLoading || !certificateData ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="animate-spin" size={36} />
                  <span>Loading credential details...</span>
                </div>
              ) : (
                <GraduationCertificate data={certificateData} />
              )}
            </div>
          }
        />
      )}
    </div>
  );
}