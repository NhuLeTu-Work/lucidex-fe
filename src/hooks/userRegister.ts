import { useState, useEffect } from 'react';
import { mockAccounts } from '../data/mockData';
import { useApp } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';
import type { RegistrationRole, BusinessData } from '../types/register';
import { registerIssuerApi } from '@/api/endpoints/issuer/registerIssuerApi';
import { registerVerifierApi } from '@/api/endpoints/verifier/registerVerifierApi';
import { registerOwnerApi, verifyOwnerOtpApi, resendOwnerOtpApi } from '@/api/endpoints/owner/registerOwnerApi';

export function useRegister() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();

  // Trạng thái chung
  const [roleType, setRoleType] = useState<RegistrationRole>('owner');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [certificate, setCertificate] = useState<File | null>(null);

  // Trạng thái Form Credential Owner
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [missingFieldKeys, setMissingFieldKeys] = useState<string[]>([]);

  // Trạng thái Form Issuer / Verifier
  const [bizData, setBizData] = useState<BusinessData>({
    orgName: '',
    taxCode: '',
    address: '',
    legalRep: '',
    email: '',
    phone: '',
    regName: '',
    regTitle: '',
  });

  // Trạng thái OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Thêm useEffect để tự động giảm thời gian
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleType(e.target.value as RegistrationRole);
    setError(null);
    setFieldErrors({});
    setIsSuccess(false);
  };

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleOwnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('errorFieldsRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }
    if (!validatePassword(password)) {
      setError(t('errorWeakPassword'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerOwnerApi({
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword, // Map biến camelCase sang snake_case của BE
      });

      if (response.success) {
        setShowOtpModal(true);
        setOtpValue('');
        setOtpError(null);
      } else {
        setError(response.message || 'Registration failed.');
      }

    } catch (err: any) {
      // 3. Xử lý lỗi trả về (Trùng email, sai format...)
      if (err.response) {
        if (err.response.status === 422) {
          setError('Dữ liệu không hợp lệ, vui lòng kiểm tra lại form.');
        } else if (err.response.status === 400 || err.response.status === 409) {
          // Tuỳ thuộc BE trả mã lỗi nào khi trùng Email (thường là 400 hoặc 409 Conflict)
          // Lấy error message từ BE, nếu không có thì dùng text fallback
          setError(err.response.data.message || t('errorEmailExists'));
        } else {
          setError(err.response.data.message || 'Lỗi kết nối đến máy chủ.');
        }
      } else {
        setError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Giả lập OAuth popup lấy được email (để test AC, ta lấy tạm giá trị user đã nhập ở ô email)
    const googleEmail = email.trim(); 
    
    if (!googleEmail) {
      setError(t('errorFieldsRequired'));
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const existingUser = mockAccounts.find(acc => acc.email.toLowerCase() === googleEmail.toLowerCase());
      
      if (existingUser) {
        if (existingUser.authProvider === 'password' || !existingUser.authProvider) {
          // AC 10: Bấm nút Google nhưng email này trước đó đã đăng ký bằng Password
          setError(t('errorEmailExistsPassword'));
          setIsLoading(false);
          return;
        }
        
        // Nếu user đã tồn tại và authProvider === 'google', thì cho đăng nhập luôn
        setIsLoading(false);
        setRole('owner');
        navigate('/owner');
        return;
      }

      // Nếu user hoàn toàn mới -> Đăng ký Google thành công (Thường OAuth Google không cần OTP nữa)
      setIsLoading(false);
      setRole('owner');
      navigate('/owner');
    }, 800);
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpValue.trim()) return;
    setOtpError(null);
    setIsOtpLoading(true);
    try {
      // Gọi API Verify OTP
      const response = await verifyOwnerOtpApi({
        email: email.trim(), // Lấy email từ state người dùng vừa điền ở bước 1
        otp_code: otpValue.trim(),
      });

      if (response.success) {
        // Đăng ký và kích hoạt thành công, cho phép vào trang owner
        setRole('owner');
        navigate('/owner');
      } else {
        setOtpError(response.message || t('errorOtpInvalid'));
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Mã OTP không hợp lệ.');
        } else if (err.response.status === 400) {
          // Xử lý các lỗi logic từ BE (ví dụ: OTP hết hạn, sai OTP...)
          setOtpError(err.response.data.message || t('errorOtpInvalid'));
        } else {
          setOtpError('Lỗi hệ thống. Vui lòng thử lại sau.');
        }
      } else {
        setOtpError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Reset các thông báo cũ
    setOtpError(null);
    setResendMessage(null);
    setIsResendOtpLoading(true);

    try {
      const response = await resendOwnerOtpApi({
        email: email.trim() // Sử dụng lại state email đã lưu
      });

      if (response.success) {
        // Thông báo thành công và xóa trắng ô nhập mã cũ
        setResendMessage(t('otpResentSuccess'));
        setOtpValue('');
        setResendCountdown(60); 
      } else {
        setOtpError(response.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Dữ liệu không hợp lệ.');
        } else {
          setOtpError(err.response.data.message || 'Lỗi hệ thống. Không thể gửi lại mã.');
        }
      } else {
        setOtpError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsResendOtpLoading(false);
    }
  };

  const handleBizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBizData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleBizRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setMissingFieldKeys([]);
    const missingKeys: string[] = [];
    const requiredKeys = roleType === 'verifier' 
      ? ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName', 'regTitle', 'certificate']
      : ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName'];

    const fieldLabelMap: Record<string, string> = {
      orgName: roleType === 'verifier' ? 'lblOrgName' : 'lblInstName',
      taxCode: 'lblTaxCode',
      address: 'lblAddress',
      legalRep: 'lblLegalRep',
      email: 'lblContactGmail',
      phone: 'lblContactPhone',
      regName: 'lblRegName',
      regTitle: 'lblRegTitle',
      certificate: 'uploadCert',
    };

    requiredKeys.forEach(key => {
      if (key === 'certificate') {
        if (!certificate) missingKeys.push(fieldLabelMap.certificate);
      } else if (!bizData[key as keyof BusinessData].trim()) {
        missingKeys.push(fieldLabelMap[key]);
      }
    });

    if (missingKeys.length > 0) {
      setError('errorMissingFields');
      setMissingFieldKeys(missingKeys);
      return;
  }

    const fErrors: Record<string, string> = {};
    if (bizData.orgName.length < 3 || bizData.orgName.length > 200) {
      fErrors.orgName = t('fmtTextLength') || 'Text, 3–200 characters';
    }
    if (!/^\d{10}$/.test(bizData.taxCode)) {
      fErrors.taxCode = t('fmtTaxCode') || 'Exactly 10 digits';
    }
    if (!/^[\p{L}\s]+$/u.test(bizData.legalRep)) {
      fErrors.legalRep = t('fmtLettersOnly') || 'Text, letters only';
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(bizData.email)) {
      fErrors.email = t('fmtGmail') || 'Valid email format (e.g. name@gmail.com)';
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(bizData.phone)) {
      fErrors.phone = t('fmtPhone') || '10-digit Vietnamese phone number';
    }
    if (!/^[\p{L}\s]+$/u.test(bizData.regName)) {
      fErrors.regName = t('fmtLettersOnly') || 'Text, letters only';
    }

    if (Object.keys(fErrors).length > 0) {
      setFieldErrors(fErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Chuẩn bị chung payload cho cả 2 role (để không phải viết lặp lại map dữ liệu)
      const payload = {
        name: bizData.orgName,
        tax_code: bizData.taxCode,
        address: bizData.address,
        legal_rep_name: bizData.legalRep,
        contact_email: bizData.email,
        contact_phone: bizData.phone,
        registrant_name: bizData.regName,
        document: certificate as File, // Ép kiểu để TS không báo lỗi vì đã check null ở logic validation
      };

      let response;

      // Phân luồng gọi API dựa vào RoleType
      if (roleType === 'issuer' && certificate) {
        response = await registerIssuerApi(payload);
      } else if (roleType === 'verifier' && certificate) {
        response = await registerVerifierApi(payload);
      }

      // Xử lý chung kết quả trả về
      if (response && response.success) {
        setIsSuccess(true);
      } else if (response) {
        setError(response.message || 'Registration failed. Please try again.');
      }
      
    } catch (err: any) {
      // 3. Xử lý lỗi 422 từ backend (giữ nguyên)
      if (err.response && err.response.status === 422) {
        setError('Dữ liệu không hợp lệ, vui lòng kiểm tra lại form.');
        // Console.log ra để xem chi tiết lỗi 422 backend trả về
        console.log('Validation Error Details:', err.response.data.detail);
      } else {
        setError(err.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSubtitle = () => {
    switch(roleType) {
      case 'issuer': return t('subtitleIssuer');
      case 'verifier': return t('subtitleVerifier');
      default: return t('subtitleOwner');
    }
  };

  return {
    roleType, handleRoleChange, error, missingFieldKeys, fieldErrors, isLoading, isSuccess,
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    bizData, certificate, setCertificate, handleBizChange, handleBizRegister,
    showOtpModal, setShowOtpModal, otpValue, setOtpValue, otpError, setOtpError,
    isOtpLoading, handleOwnerRegister, handleGoogleRegister, handleVerifyOTP, getSubtitle, t, setRole,
    isResendOtpLoading,
    resendMessage,
    handleResendOTP,
    resendCountdown
  };
}