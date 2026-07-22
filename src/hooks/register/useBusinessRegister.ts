// src/hooks/register/useBusinessRegister.ts
import { registerOrganizationApi } from '@/api/endpoints/business/registerOrganizationApi';
import type { RegisterState, BusinessData } from './types';
import type { OrgType } from '../../api/types/business.types';

export function useBusinessRegister(
  state: RegisterState,
  t: any
) {
  const {
    bizData, setBizData, fieldErrors, setFieldErrors,
    roleType, setError, setMissingFieldKeys, certificate,
    setIsLoading, setIsSuccess
  } = state;

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
    
    // Validate missing fields
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

    // Validate format
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
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(bizData.email)) {
      fErrors.email = t('fmtEmail') || 'Please enter a valid email address (e.g. name@example.com)';
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
      const payload = {
        name: bizData.orgName,
        tax_code: bizData.taxCode,
        address: bizData.address,
        legal_rep_name: bizData.legalRep,
        contact_email: bizData.email,
        contact_phone: bizData.phone,
        registrant_name: bizData.regName,
        document: certificate as File,
      };

      // Tối ưu hóa: Gọi chung 1 hàm duy nhất với tham số roleType ('issuer' hoặc 'verifier')
      const response = await registerOrganizationApi(roleType as OrgType, payload);

      if (response && response.success) {
        setIsSuccess(true);
      } else if (response) {
        setError(response.message || 'Registration failed. Please try again.');
      }
      
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setError('Dữ liệu không hợp lệ, vui lòng kiểm tra lại form.');
        console.log('Validation Error Details:', err.response.data.detail);
      } else if (err.response?.status === 400 || err.response?.status === 409) {
        setError(err.response?.data?.message || 'Tổ chức này đã đăng ký hoặc thông tin bị trùng lặp.');
      } else {
        setError(err.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleBizChange, handleBizRegister };
}