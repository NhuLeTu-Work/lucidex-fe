import { verifyOwnerOtpApi } from '@/api/endpoints/owner/verifyOwnerOtpApi';
import { toast } from 'sonner'; // Hoặc thư viện toast bạn đang dùng

export function useOwnerRegisterOtp(
  state: any, // Thay 'any' bằng 'RegisterState' nếu bạn đã định nghĩa
  t: (key: string) => string,
  navigate: any
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
      setOtpError(t('errorOtpInvalid') || 'Vui lòng nhập đầy đủ mã OTP.');
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
        // 1. Lưu token vào localStorage
        const { access_token, refresh_token } = response.data;
        if (access_token) localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

        // 2. Tắt Modal OTP
        setShowOtpModal(false);
        
        // 3. Hiển thị thông báo thành công
        toast.success(t('registerSuccess') || 'Xác thực thành công! Đang chuyển hướng...');
        
        // 4. Chuyển hướng thẳng vào trang Owner
        navigate('/owner');
      } else {
        setOtpError('errorOtpInvalid');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Mã OTP sai định dạng.');
        } else if (err.response.status === 400 || err.response.status === 404) {
          setOtpError(err.response.data.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
        } else {
          setOtpError('Lỗi máy chủ. Vui lòng thử lại sau.');
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