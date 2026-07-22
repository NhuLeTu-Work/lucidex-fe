import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/login/useLogin';
// Components
import { LoginForm } from '../components/login/LoginForm';
import { PendingStatus } from '../components/login/PendingStatus';
import { RejectedStatus } from '../components/login/RejectedStatus';
import { SetupPasswordForm } from '../components/login/SetupPasswordForm';
import { TwoFactorForm } from '../components/login/TwoFactorForm';
import { AdminGoogleAuthForm } from '../components/admin/AdminGoogleAuthForm';

export function Login() {
  const navigate = useNavigate();
  const hookProps = useLogin();
  const { view, currentAcc, setView, t } = hookProps;
  const token = localStorage.getItem('access_token');
  
  // useEffect(() => {
  //   if (token) {
  //     navigate("/", { replace: true });
  //   }
  // }, [token, navigate]);
  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {view === 'login' && <LoginForm hookProps={hookProps} />}
        
        {view === 'pending' && currentAcc && (
          <PendingStatus currentAcc={currentAcc} setView={setView} t={t} />
        )}
        
        {view === 'rejected' && currentAcc && (
          <RejectedStatus currentAcc={currentAcc} t={t} />
        )}
        
        {view === 'setup' && (
          <SetupPasswordForm hookProps={hookProps} />
        )}
        
        {(view === 'login_2fa' || view === 'setup_2fa') && currentAcc && (
          currentAcc.type === 'admin' || currentAcc.type === 'super' 
            ? <AdminGoogleAuthForm hookProps={hookProps} />
            : <TwoFactorForm hookProps={hookProps} />
        )}

      </div>
    </div>
  );
}