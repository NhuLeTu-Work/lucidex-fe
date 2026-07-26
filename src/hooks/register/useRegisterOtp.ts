import { verifyOwnerOtpApi } from '@/api/endpoints/owner/registerOwnerApi';
import type { RegisterState } from './types';

export function useRegisterOtp(
  state: RegisterState,
  t: any,
  setRole: any,
  navigate: any
) {
  // 1. Chỉ lấy những state cần thiết cho việc Verify từ cấu trúc RegisterState cũ
  const {
    otpValue, setOtpError, setIsOtpLoading, email
  } = state;

  // 4. Giữ nguyên logic Verify OTP hiện tại của bạn
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpValue.trim()) return;
    
    setOtpError(null);
    setIsOtpLoading(true);
    
    try {
      const response = await verifyOwnerOtpApi({
        email: email.trim(),
        otp_code: otpValue.trim(),
      });

      if (response.success) {
        setRole('owner');
        navigate('/owner');
      } else {
        setOtpError('errorOtpInvalid');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Mã OTP không hợp lệ.');
        } else if (err.response.status === 400) {
          setOtpError(err.response.data.message || t('errorOtpInvalid'));
        }
      } else {
        setOtpError('errorNetwork');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  // 5. Trả về cả các hàm xử lý lẫn các state hiển thị (Loading, Đếm ngược, Thông báo) để UI sử dụng
  return { 
    handleVerifyOTP,
  };
}