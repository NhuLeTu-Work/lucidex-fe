import { useApp} from '../app/AppContext';
import { useIssuerPortal } from '../hooks/issuer/userIssuerRequests';
import { useEffect } from 'react';
import { useAuthMe } from '@/hooks/auth/useAuthMe';
// Components
import { IssuerSidebarDesktop, IssuerSidebarMobile } from '../components/issuer/IssuerSideBar';
import { IssuerDashboard } from '../components/issuer/IssuerDashBoard';
import { IssuerUpload } from '../components/issuer/IssuerUpload';
import { IssuerReview } from '../components/issuer/IssuerReview';
import { IssuerAnalytics } from '../components/issuer/IssuerAnalytics';

export function IssuerPortal() {
  const { t } = useApp();
  const {
    activeTab, setActiveTab,
    reviewItems, uploadState,
    handleApprove, handleReject, handleUpload,
    pendingCount
  } = useIssuerPortal();
  const { showToast } = useApp();
  const { userProfile, fetchProfile } = useAuthMe(showToast);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <IssuerSidebarDesktop 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        pendingCount={pendingCount} t={t} 
        userProfile={userProfile}
      />
      
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <IssuerSidebarMobile 
          activeTab={activeTab}
          setActiveTab={setActiveTab} 
          pendingCount={pendingCount}
          t={t} 
          userProfile={userProfile}
        />

        {activeTab === 'dashboard' && (
          <IssuerDashboard t={t} pendingCount={pendingCount} onTabChange={setActiveTab}
            userProfile={userProfile}
          />
        )}
        
        {activeTab === 'upload' && (
          <IssuerUpload t={t} uploadState={uploadState} onUpload={handleUpload} />
        )}
        
        {activeTab === 'review' && (
          <IssuerReview t={t} items={reviewItems} onApprove={handleApprove} onReject={handleReject} />
        )}
        
        {activeTab === 'analytics' && (
          <IssuerAnalytics t={t} />
        )}
      </main>
    </div>
  );
}