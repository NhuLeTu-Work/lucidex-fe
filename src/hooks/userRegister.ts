import { useState } from 'react';
import { mockAccounts } from '../data/mockData';
import { useApp } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';
import type { RegistrationRole, BusinessData } from '../types/register';

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

  const handleOwnerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('errorFieldsRequired') || 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch') || 'Password and Confirm Password do not match.');
      return;
    }
    if (!validatePassword(password)) {
      setError(t('errorWeakPassword') || 'Password must contain at least 8 characters...');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Kiểm tra user có tồn tại trong mockData không
      const existingUser = mockAccounts.find(acc => acc.email.toLowerCase() === email.trim().toLowerCase());
      
      if (existingUser) {
        if (existingUser.authProvider === 'google') {
          // AC 9: Nhập form bằng email đã đăng ký qua Google
          setError(t('errorEmailExistsGoogle') || 'This email is already registered via Google. Please log in using Google.');
        } else {
          // AC 4: Nhập form bằng email đã đăng ký bằng Password
          setError(t('errorEmailExists') || 'This email is already registered.');
        }
        setIsLoading(false);
        return; // Dừng lại, không gửi OTP
      }

      // Nếu email chưa tồn tại -> Thành công, mở OTP Modal
      setIsLoading(false);
      setShowOtpModal(true);
      setOtpValue('');
      setOtpError(null);
    }, 800);
  };

  const handleGoogleRegister = () => {
    // Giả lập OAuth popup lấy được email (để test AC, ta lấy tạm giá trị user đã nhập ở ô email)
    const googleEmail = email.trim(); 
    
    if (!googleEmail) {
      setError(t('errorFieldsRequired') || 'Please enter an email to test Google Signup.');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const existingUser = mockAccounts.find(acc => acc.email.toLowerCase() === googleEmail.toLowerCase());
      
      if (existingUser) {
        if (existingUser.authProvider === 'password' || !existingUser.authProvider) {
          // AC 10: Bấm nút Google nhưng email này trước đó đã đăng ký bằng Password
          setError(t('errorEmailExistsPassword') || 'This email is already registered with a password. Please log in using your email and password.');
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

  const handleVerifyOTP = () => {
    if (!otpValue.trim()) return;
    setOtpError(null);
    setIsOtpLoading(true);
    setTimeout(() => {
      if (otpValue === '123456') {
        setRole('owner');
        navigate('/owner')
      } else if (otpValue === '000000') {
        setOtpError(t('errorOtpExpired') || 'OTP has expired.');
      } else {
        setOtpError(t('errorOtpInvalid') || 'Invalid OTP.');
      }
      setIsOtpLoading(false);
    }, 800);
  };

  const handleBizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBizData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleBizRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const missingFields: string[] = [];
    const requiredKeys = roleType === 'verifier' 
      ? ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName', 'regTitle', 'certificate']
      : ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName'];

    requiredKeys.forEach(key => {
      if (key === 'certificate') {
        if (!certificate) missingFields.push(t('uploadCert') || 'Business registration certificate');
      } else {
        if (!bizData[key as keyof BusinessData].trim()) {
          const fieldLabelMap: Record<string, string> = {
            orgName: roleType === 'verifier' ? 'lblOrgName' : 'lblInstName',
            taxCode: 'lblTaxCode',
            address: 'lblAddress',
            legalRep: 'lblLegalRep',
            email: 'lblContactGmail',
            phone: 'lblContactPhone',
            regName: 'lblRegName',
            regTitle: 'lblRegTitle',
          };
          missingFields.push(t(fieldLabelMap[key]) || key);
        }
      }
    });

    if (missingFields.length > 0) {
      setError(`${t('errorMissingFields') || 'Please fill in the following required field(s):'} ${missingFields.join(', ')}.`);
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
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  const getSubtitle = () => {
    switch(roleType) {
      case 'issuer': return t('subtitleIssuer') || 'Register your institution to start issuing digital credentials.';
      case 'verifier': return t('subtitleVerifier') || 'Register your organization to verify credentials seamlessly.';
      default: return t('subtitleOwner') || 'Join us to securely manage your credentials.';
    }
  };

  return {
    roleType, handleRoleChange, error, fieldErrors, isLoading, isSuccess,
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    bizData, certificate, setCertificate, handleBizChange, handleBizRegister,
    showOtpModal, setShowOtpModal, otpValue, setOtpValue, otpError, setOtpError,
    isOtpLoading, handleOwnerRegister, handleGoogleRegister, handleVerifyOTP, getSubtitle, t, setRole
  };
}