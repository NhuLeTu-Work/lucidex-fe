import { verifyOwnerOtpApi } from '@/api/endpoints/owner/verifyOwnerOtpApi';

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
        const { access_token, refresh_token } = response.data;
        if (access_token) localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

        setShowOtpModal(false);
        setRole('owner')
        navigate('/owner');
      } else {
        setOtpError('errorOtpInvalid');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('errorOtpInvalid');
        }
      } else {
        setOtpError('Lỗi kết nối mạng.');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  return { 
    handleOwnerRegisterOtp 
  };
}