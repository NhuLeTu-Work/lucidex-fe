import { useState } from 'react';
import { setupPasswordAndRequestOtp, verifyInviteOtp } from '@/api/endpoints/business/setupPasswordApi';
import type { OrgType } from '@/api/types/business.types';
import { toast } from 'sonner';

// Thêm tham số emailUrl vào hook (để lấy từ link invite)
export function useSetupPassword(inviteToken: string, orgType: OrgType, emailUrl: string = '', onSuccess: () => void) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // === Bổ sung các state còn thiếu ===
  const [error, setError] = useState<string | null>(null);
  const [email] = useState<string>(emailUrl); // Email lấy từ tham số URL
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset lỗi mỗi lần submit

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        invite_token: inviteToken,
        password: password,
        confirm_password: confirmPassword,
      };

      const response = await setupPasswordAndRequestOtp(orgType, payload);

      if (response.success) {
        setIsSuccess(true);
        onSuccess();
        // Lưu ý: Thường lúc này bạn sẽ mở Modal OTP lên (tùy vào logic UI của bạn)
      } else {
        setError(response.message || 'Có lỗi xảy ra.');
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('Link lời mời đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ Admin.');
      } else {
        setError(err.response?.data?.message || 'Lỗi kết nối hoặc token đã hết hạn.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent, otpValue: string) => {
    e.preventDefault();

    if (!otpValue || otpValue.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyInviteOtp(orgType, {
        invite_token: inviteToken,
        otp_code: otpValue,
      });

      if (response.success) {
        toast.success(response.message || 'Xác thực tài khoản thành công! Đang chuyển hướng...');
        
        // Đóng modal và chuyển hướng về trang đăng nhập
        setTimeout(() => {
          window.location.href = '/login'; 
        }, 1500);
      }
    } catch (err: any) {
      // Xử lý lỗi trả về (OTP sai, hết hạn...)
      if (err.response?.status === 422) {
        toast.error('Mã OTP không hợp lệ hoặc đã hết hạn.');
      } else {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading, isSuccess,
    error, setError, 
    email,           
    handleSetupPassword,
    handleVerifyOtp,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
}