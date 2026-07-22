import { AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Thêm useSearchParams

// Hooks
import { useRegister } from '../hooks/register/userRegister';
import { useSetupPassword } from '../hooks/business/useSetupPassword'; // Hook gọi API setup password đã tạo trước đó

// Components
import { RoleSelector } from '../components/register/RoleSelector';
import { OwnerRegisterForm } from '../components/register/OwnerRegisterForm';
import { BusinessRegisterForm } from '../components/register/BusinessRegisterForm';
import { OrgSetupPasswordForm } from '../components/register/OrganizationsSetupForm'; // Import form mới
import { SuccessStatus } from '../components/register/SuccessStatus';
import { OtpModal } from '../components/register/OtpModal';

export function Register() {
  const navigate = useNavigate();
  
  // 1. Lấy token và type từ URL (VD: /register?token=abc&type=issuer)
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const inviteType = searchParams.get('type') as 'issuer' | 'verifier' | null;
  const inviteEmail = searchParams.get('email') || '';
  // Xác định xem user có đang ở luồng Invite hay không
  const isInviteFlow = !!inviteToken; 

  // 2. Khởi tạo Hook Đăng ký bình thường
  const normalRegisterProps = useRegister();
  
  // 3. Khởi tạo Hook Setup Password (Chỉ dùng khi có token)
  const setupPasswordProps = useSetupPassword(
    inviteToken || '', 
    inviteType || 'issuer', 
    inviteEmail,
    () => setShowOtpModal(true) // <--- Bước này giúp display OTP Modal
  );
  // Trích xuất các props cần thiết cho giao diện chung
  const {
    roleType, handleRoleChange, missingFieldKeys, fieldErrors, 
    bizData, certificate, setCertificate, handleBizChange, handleBizRegister,
    showOtpModal, setShowOtpModal, otpValue, setOtpValue, otpError,
    isOtpLoading, handleOwnerRegisterOtp, getSubtitle, t,
    isResendOtpLoading, resendMessage, handleResendOTP, resendCountdown
  } = normalRegisterProps;

  // Hợp nhất trạng thái lỗi và loading giữa 2 luồng để UI tự hiển thị đúng
  const error = isInviteFlow ? setupPasswordProps.error : normalRegisterProps.error;
  const isLoading = isInviteFlow ? setupPasswordProps.isLoading : normalRegisterProps.isLoading;
  const isSuccess = isInviteFlow ? setupPasswordProps.isSuccess : normalRegisterProps.isSuccess;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className={`w-full flex flex-col gap-6 transition-all ${(!isInviteFlow && roleType === 'owner') ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          
          {/* Header luồng bình thường */}
          {!isSuccess && !isInviteFlow && (
            <RoleSelector 
              roleType={roleType} 
              handleRoleChange={handleRoleChange} 
              isSuccess={isSuccess} 
              getSubtitle={getSubtitle} 
              t={t} 
            />
          )}

          {/* Header luồng Invite */}
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

          {/* Hiển thị lỗi chung */}
          {error && (
            <div className="p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium text-balance">{error === 'errorMissingFields' && !isInviteFlow
                ? `${t('errorMissingFields')} ${missingFieldKeys.map(k => t(k)).join(', ')}.`
                : t(error) || error}</span>
            </div>
          )}

          {/* =========================================
              RENDER CÁC FORM DỰA TRÊN LUỒNG
          ========================================= */}
          
          {/* 1. Form LUỒNG INVITE (Chỉ hiện khi có token) */}
          {isInviteFlow && !isSuccess && (
            <OrgSetupPasswordForm 
              hookProps={{ ...setupPasswordProps, t }} // Truyền hook mới vào form
            />
          )}

          {/* 2. Form LUỒNG BÌNH THƯỜNG: Owner */}
          {!isInviteFlow && roleType === 'owner' && !isSuccess && (
            <OwnerRegisterForm hookProps={normalRegisterProps} />
          )}

          {/* 3. Form LUỒNG BÌNH THƯỜNG: Business */}
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

          {/* Trạng thái thành công chung */}
          {isSuccess && <SuccessStatus roleType={isInviteFlow ? inviteType! : roleType} />}

          {/* Link chuyển sang đăng nhập (Ẩn nếu đăng ký thành công hoặc đang ở luồng Invite) */}
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

      {/* Modal OTP (Dùng cho cả luồng Owner hoặc Invite sau khi set password thành công) */}
      {showOtpModal && (
        <OtpModal 
          email={normalRegisterProps.email} 
          otpValue={otpValue} 
          setOtpValue={setOtpValue} 
          otpError={otpError} 
          isOtpLoading={isOtpLoading} 
          onVerify={(e) => {
            if (isInviteFlow) {
              setupPasswordProps.handleVerifyOtp(e, otpValue); // Truyền thêm otpValue
            } else {
              handleOwnerRegisterOtp(e);
            }
          }}
          onClose={() => setShowOtpModal(false)} 
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