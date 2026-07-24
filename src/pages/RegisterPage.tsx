import { AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Hooks
import { useRegister } from '../hooks/register/userRegister';
import { useSetupPassword } from '../hooks/business/useSetupPassword';

// Components
import { RoleSelector } from '../components/register/RoleSelector';
import { OwnerRegisterForm } from '../components/register/OwnerRegisterForm';
import { BusinessRegisterForm } from '../components/register/BusinessRegisterForm';
import { OrgSetupPasswordForm } from '../components/register/OrganizationsSetupForm';
import { SuccessStatus } from '../components/register/SuccessStatus';
import { OtpModal } from '../components/register/OtpModal';

export function Register() {
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const inviteType = searchParams.get('type') as 'issuer' | 'verifier' | null;
  const inviteEmail = searchParams.get('email') || '';
  
  const isInviteFlow = !!inviteToken; 

  const normalRegisterProps = useRegister();
  
  const setupPasswordProps = useSetupPassword(
    inviteToken || '', 
    inviteType || 'issuer', 
    inviteEmail,
    () => normalRegisterProps.setShowOtpModal(true) // Dùng hàm từ normalProps để bật modal
  );

  const {
    roleType, handleRoleChange, missingFieldKeys, fieldErrors, 
    bizData, certificate, setCertificate, handleBizChange, handleBizRegister,
    showOtpModal, setShowOtpModal, otpValue, setOtpValue, otpError,
    isOtpLoading, handleOwnerRegisterOtp, getSubtitle, t,
    isResendOtpLoading, resendMessage, handleResendOTP, resendCountdown
  } = normalRegisterProps;

  // 1. Hợp nhất trạng thái Form
  const error = isInviteFlow ? setupPasswordProps.error : normalRegisterProps.error;
  const isLoading = isInviteFlow ? setupPasswordProps.isLoading : normalRegisterProps.isLoading;
  const isSuccess = isInviteFlow ? setupPasswordProps.isSuccess : normalRegisterProps.isSuccess;

  // 2. HỢP NHẤT TRẠNG THÁI OTP MODAL (Quan trọng để UI bắt được sự kiện loading/error)
  const finalOtpError = isInviteFlow ? setupPasswordProps.otpError : otpError;
  const finalIsOtpLoading = isInviteFlow ? setupPasswordProps.isOtpLoading : isOtpLoading;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className={`w-full flex flex-col gap-6 transition-all ${(!isInviteFlow && roleType === 'owner') ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          
          {!isSuccess && !isInviteFlow && (
            <RoleSelector 
              roleType={roleType} 
              handleRoleChange={handleRoleChange} 
              isSuccess={isSuccess} 
              getSubtitle={getSubtitle} 
              t={t} 
            />
          )}

          {!isSuccess && isInviteFlow && (
            <div className="text-center mb-2">
              <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>
                {t('setupAccount') || 'Set Up Your Account'}
              </h1>
              <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
                {t('setupAccountDesc') || `You have been invited as an ${inviteType}. Please set a secure password to activate your account.`}
              </p>
            </div>
          )}

          {error && (
            <div 
              className="p-4 rounded-xl border flex items-start gap-3 text-sm animate-in shake duration-300" 
              style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}
            >
              <AlertCircle size={18} className="shrink-0 mt-[2px]" />
              <span className="font-medium leading-relaxed">
                {error === 'errorMissingFields' && !isInviteFlow
                  ? `${t('errorMissingFields')} ${missingFieldKeys.map(k => t(k)).join(', ')}.`
                  : t(error) || error}
              </span>
            </div>
          )}

          {isInviteFlow && !isSuccess && (
            <OrgSetupPasswordForm 
              hookProps={{ ...setupPasswordProps, t }} 
            />
          )}

          {!isInviteFlow && roleType === 'owner' && !isSuccess && (
            <OwnerRegisterForm hookProps={normalRegisterProps} />
          )}

          {!isInviteFlow && (roleType === 'issuer' || roleType === 'verifier') && !isSuccess && (
            <BusinessRegisterForm 
              roleType={roleType} 
              bizData={bizData} 
              fieldErrors={fieldErrors} 
              isLoading={isLoading} 
              certificate={certificate} 
              setCertificate={setCertificate} 
              handleBizChange={handleBizChange} 
              handleBizRegister={handleBizRegister} 
              t={t} 
            />
          )}

          {isSuccess && <SuccessStatus roleType={isInviteFlow ? inviteType! : roleType} />}

          {!isSuccess && !isInviteFlow && (
            <div className="pt-2 text-center text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--ct-text)' }}>
              <span className="opacity-70">{t('alreadyHaveAccount') || 'Already have an account?'}</span>
              <button type="button" onClick={() => navigate('/login')} className="font-semibold hover:underline opacity-100">
                {t('signIn') || 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showOtpModal && (
        <OtpModal 
          email={isInviteFlow ? setupPasswordProps.email : normalRegisterProps.email} 
          otpValue={otpValue} 
          setOtpValue={setOtpValue} 
          // Truyền state đã hợp nhất vào đây
          otpError={finalOtpError} 
          isOtpLoading={finalIsOtpLoading} 
          onVerify={(e) => {
            if (isInviteFlow) {
              setupPasswordProps.handleVerifyOtp(e, otpValue);
            } else {
              handleOwnerRegisterOtp(e);
            }
          }}
          onClose={() => {
            setShowOtpModal(false);
            if (isInviteFlow) setupPasswordProps.setOtpError(null);
          }} 
          t={t} 
          isResendOtpLoading={isResendOtpLoading}
          resendMessage={resendMessage}
          onResend={handleResendOTP}
          resendCountdown={resendCountdown}
        />
      )}
    </div>
  );
}