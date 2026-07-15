import type { AppContextType } from '../App';
import { useOwnerPortal } from '../hooks/owner/useOwnerPortal';

import { OwnerSidebarDesktop, OwnerSidebarMobile } from '../components/owner/OwnerSidebar';
import { OwnerDashboard } from '../components/owner/OwnerDashboard';
import { OwnerCredentials } from '../components/owner/OwnerCredentials';
import { OwnerLinks } from '../components/owner/OwnerLinks';
import { OwnerAudit } from '../components/owner/OwnerAudit';
import { OwnerConsent } from '../components/owner/OwnerConsent';
import { OwnerClaim } from '../components/owner/OwnerClaim';
import { CreateLinkModal } from '../components/owner/OwnerLinkModal';

export function OwnerPortal({ ctx }: { ctx: AppContextType }) {
  const { t } = ctx;
  const {
    activeTab, setActiveTab,
    links, showCreateModal, setShowCreateModal,
    claimStep, setClaimStep, otpValue, setOtpValue,
    showOtpMock, setShowOtpMock,
    handleRevokeLink, handleCreateLink
  } = useOwnerPortal();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <OwnerSidebarDesktop activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <OwnerSidebarMobile activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

        {activeTab === 'dashboard' && <OwnerDashboard t={t} links={links} onTabChange={setActiveTab} />}
        {activeTab === 'credentials' && <OwnerCredentials t={t} />}
        {activeTab === 'links' && <OwnerLinks t={t} links={links} onRevoke={handleRevokeLink} onCreate={() => setShowCreateModal(true)} />}
        {activeTab === 'audit' && <OwnerAudit t={t} />}
        {activeTab === 'consent' && <OwnerConsent t={t} />}
        {activeTab === 'claim' && (
          <OwnerClaim 
            t={t} step={claimStep} setStep={setClaimStep} 
            otpValue={otpValue} setOtpValue={setOtpValue} 
            showOtpMock={showOtpMock} setShowOtpMock={setShowOtpMock} 
          />
        )}
      </main>

      {showCreateModal && (
        <CreateLinkModal t={t} onClose={() => setShowCreateModal(false)} onCreate={handleCreateLink} />
      )}
    </div>
  );
}