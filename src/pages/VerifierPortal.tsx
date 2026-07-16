import { useApp } from '../app/AppContext';
import { useVerifierPortal } from '../hooks/verifier/userVerifierPortal';
import { VerifierSidebarDesktop, VerifierSidebarMobile } from '../components/verifier/VerifierSidebar';
import { VerifierDashboard } from '../components/verifier/VerifierDashboard';
import { VerifierVerify } from '../components/verifier/VerifierVerify';
import { VerifierHistory } from '../components/verifier/VerifierHistory';
import { VerifierQuota } from '../components/verifier/VerifierQuota';
import { VerifierRegister } from '../components/verifier/VerifierRegister';

export function VerifierPortal() {
  const { t } = useApp()
  const {
    activeTab, setActiveTab,
    quotaUsed,
    verifyResult,
    verifiedData,
    handleVerify
  } = useVerifierPortal();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <VerifierSidebarDesktop 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        quotaUsed={quotaUsed} t={t} 
      />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <VerifierSidebarMobile 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          quotaUsed={quotaUsed} t={t} 
        />

        {activeTab === 'dashboard' && (
          <VerifierDashboard t={t} quotaUsed={quotaUsed} onTabChange={setActiveTab} />
        )}
        
        {activeTab === 'verify' && (
          <VerifierVerify 
            t={t} result={verifyResult} verifiedData={verifiedData} 
            onVerify={handleVerify} quotaUsed={quotaUsed} 
          />
        )}
        
        {activeTab === 'history' && <VerifierHistory t={t} />}
        
        {activeTab === 'quota' && <VerifierQuota t={t} quotaUsed={quotaUsed} />}
        
        {activeTab === 'register' && <VerifierRegister t={t} />}
      </main>
    </div>
  );
}