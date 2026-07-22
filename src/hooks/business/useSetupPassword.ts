import { useState } from 'react';
import { setupPasswordAndRequestOtp } from '@/api/endpoints/business/setupPasswordApi';
import type { OrgType } from '@/api/types/business.types';

// Thêm tham số emailUrl vào hook (để lấy từ link invite)
export function useSetupPassword(inviteToken: string, orgType: OrgType, emailUrl: string = '') {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // === Bổ sung các state còn thiếu ===
  const [error, setError] = useState<string | null>(null);
  const [email] = useState<string>(emailUrl); // Email lấy từ tham số URL

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

  // === Bổ sung hàm handleVerifyOtp (Hiện tại đang mock, sau này có API OTP thì lắp vào) ===
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Gắn API Verify OTP của Issuer/Verifier vào đây
    setTimeout(() => {
      setIsLoading(false);
      alert('Xác thực OTP thành công! Đang chuyển hướng...');
      window.location.href = '/login'; 
    }, 1000);
  };

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading, isSuccess,
    error, setError, // <-- Export error
    email,           // <-- Export email
    handleSetupPassword,
    handleVerifyOtp  // <-- Export hàm verify OTP
  };
}