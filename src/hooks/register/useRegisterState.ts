import { useState } from 'react';
import type { RegistrationRole, BusinessData } from '../../types/register';

export function useRegisterState() {
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
  const [fullName, setFullName] = useState('');
  return {
    roleType, setRoleType,
    error, setError,
    fieldErrors, setFieldErrors,
    isLoading, setIsLoading,
    isSuccess, setIsSuccess,
    certificate, setCertificate,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    fullName, setFullName,
    missingFieldKeys, setMissingFieldKeys,
    bizData, setBizData,
    showOtpModal, setShowOtpModal,
    otpValue, setOtpValue,
    otpError, setOtpError,
    isOtpLoading, setIsOtpLoading,
    resendCountdown, setResendCountdown,
  };
}