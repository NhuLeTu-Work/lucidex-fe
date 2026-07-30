import { verifyOwnerOtpApi } from '@/api/endpoints/owner/verifyOwnerOtpApi';
import { saveTokens } from '../useSessionTimer';

export function useOwnerRegisterOtp(
  state: any, 
  navigate: any, 
  setRole: any
) {
  const {
    email,
    otpValue,
    setOtpError,
    setIsOtpLoading,
    setShowOtpModal
  } = state;

  const handleOwnerRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate nhanh mã OTP
    if (!otpValue || otpValue.trim().length < 4) {
      setOtpError('errorOtpInvalid');
      return;
    }

    setIsOtpLoading(true);
    setOtpError(null);

    try {
      const payload = {
        email: email.trim(),
        otp_code: otpValue.trim(),
      };

      const response = await verifyOwnerOtpApi(payload);

      if (response.success && response.data) {
        saveTokens(response.data.access_token, response.data.refresh_token, response.data.refresh_token_expires_at);
        setShowOtpModal(false);
        setRole('owner')
        navigate('/owner');
      } else {
        setOtpError('errorOtpInvalid');
      }
    } catch (err: any) {
      if (err.response.status === 400 && err.response.data.error_code === 'OWNER_ALREADY_ACTIVE') {
        setOtpError('errorOwnerAlreadyActive');
      } else if (err.response.status === 400 && err.response.data.error_code === 'INVALID_OTP') {
        setOtpError('errorOtpInvalid');
      } else if (err.response.status === 404 && err.response.data.error_code === 'OWNER_NOT_FOUND') {
        setOtpError('errorOwnerNotFound');
      } else if (err.response.status === 422) {
        setOtpError('errorValidationOtp');
      } else {
        // Fallback
        setOtpError('errorActionFailed');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  return { 
    handleOwnerRegisterOtp 
  };
}