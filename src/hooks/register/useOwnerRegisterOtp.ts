import { verifyOwnerOtpApi } from '@/api/endpoints/owner/verifyOwnerOtpApi';

// (Tùy chọn) Bạn có thể import type RegisterState nếu đang dùng chung 1 file types.ts
// import type { RegisterState } from './types';

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

    // Validate nhanh mã OTP (Thường là 4 hoặc 6 số)
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

      if (response.success) {
        // 1. Tắt Modal OTP
        setShowOtpModal(false);
        
        // 2. Chuyển hướng người dùng về trang Đăng nhập kèm State (để hiện Toast thông báo bên trang Login nếu muốn)
        navigate('/login', { 
          state: { 
            message: t('registerSuccess') || 'Đăng ký thành công! Vui lòng đăng nhập.' 
          } 
        });
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

  // Nếu sau này bạn làm thêm API Resend OTP cho Owner, bạn có thể viết hàm handleResendOTP ở đây luôn
  // const handleResendOTP = async () => { ... }

  return { 
    handleOwnerRegisterOtp 
    // handleResendOTP
  };
}