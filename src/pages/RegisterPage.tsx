import { AlertCircle } from 'lucide-react';
import { useRegister } from '../hooks/userRegister';
import { RoleSelector } from '../components/register/RoleSelector';
import { OwnerRegisterForm } from '../components/register/OwnerRegisterForm';
import { BusinessRegisterForm } from '../components/register/BusinessRegisterForm';
import { SuccessStatus } from '../components/register/SuccessStatus';
import { OtpModal } from '../components/register/OtpModal';

export function Register() {
  const hookProps = useRegister();
  const {
    roleType, handleRoleChange, error, fieldErrors, isLoading, isSuccess,
    bizData, certificate, setCertificate, handleBizChange, handleBizRegister,
    showOtpModal, setShowOtpModal, otpValue, setOtpValue, otpError,
    isOtpLoading, handleVerifyOTP, getSubtitle, email, t, setPage
  } = hookProps;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className={`w-full flex flex-col gap-6 transition-all ${roleType === 'owner' ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          
          <RoleSelector 
            roleType={roleType} 
            handleRoleChange={handleRoleChange} 
            isSuccess={isSuccess} 
            getSubtitle={getSubtitle} 
            t={t} 
          />

          {error && (
            <div className="p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium text-balance">{error}</span>
            </div>
          )}

          {roleType === 'owner' && !isSuccess && <OwnerRegisterForm hookProps={hookProps} />}

          {(roleType === 'issuer' || roleType === 'verifier') && !isSuccess && (
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

          {isSuccess && <SuccessStatus setPage={setPage} t={t} />}

          <div className="pt-2 text-center text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--ct-text)' }}>
            <span className="opacity-70">{t('alreadyHaveAccount') || 'Already have an account?'}</span>
            <button type="button" onClick={() => setPage('login')} className="font-semibold hover:underline opacity-100">
              {t('signIn') || 'Sign In'}
            </button>
          </div>

        </div>
      </div>

      {showOtpModal && (
        <OtpModal 
          email={email} 
          otpValue={otpValue} 
          setOtpValue={setOtpValue} 
          otpError={otpError} 
          isOtpLoading={isOtpLoading} 
          onVerify={handleVerifyOTP} 
          onClose={() => setShowOtpModal(false)} 
          t={t} 
        />
      )}
    </div>
  );
}