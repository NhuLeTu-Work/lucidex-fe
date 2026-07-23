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

    // ==========================================
    // 1. KIỂM TRA FORMAT (Đồng bộ với Backend)
    // ==========================================
    const fErrors: Record<string, string> = {};

    if (bizData.orgName.length < 1 || bizData.orgName.length > 200) {
      fErrors.orgName = t('fmtTextLength') || 'Text, 1–200 characters';
    }
    
    if (!/^\d{10}(?:-\d{3})?$/.test(bizData.taxCode.trim())) {
      fErrors.taxCode = t('fmtTaxCode') || 'Exactly 10 digits or 13 with dash';
    }
    
    if (bizData.address.length < 1 || bizData.address.length > 500) {
      fErrors.address = t('fmtAddressLength') || 'Text, 1–500 characters';
    }
    
    if (bizData.legalRep.length < 1 || bizData.legalRep.length > 200) {
      fErrors.legalRep = t('fmtTextLength') || 'Text, 1–200 characters';
    }
    
    const emailRegex = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
    if (!emailRegex.test(bizData.email.trim())) {
      fErrors.email = t('fmtEmail') || 'Please enter a valid email address';
    }
    
    const normalizedPhone = bizData.phone.replace(/[\s.()]/g, '');
    if (!/^0(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      fErrors.phone = t('fmtPhone') || '10-digit Vietnamese phone number';
    }
    
    if (bizData.regName.length < 1 || bizData.regName.length > 200) {
      fErrors.regName = t('fmtTextLength') || 'Text, 1–200 characters';
    }

    if (Object.keys(fErrors).length > 0) {
      setFieldErrors(fErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // ==========================================
      // 2. TẠO PAYLOAD VÀ MAP KEY (Trường hợp A)
      // ==========================================
      const formData = new FormData();
      formData.append('name', bizData.orgName);
      formData.append('tax_code', bizData.taxCode.trim());
      formData.append('address', bizData.address);
      formData.append('legal_rep_name', bizData.legalRep);
      formData.append('contact_email', bizData.email.trim());
      formData.append('contact_phone', normalizedPhone); // Gửi số điện thoại đã làm sạch
      formData.append('registrant_name', bizData.regName);
      
      // Nếu role verifier có yêu cầu thêm registrant_title
      if (roleType === 'verifier' && bizData.regTitle) {
        formData.append('registrant_title', bizData.regTitle);
      }

      if (certificate) {
        formData.append('document', certificate);
      }

      // Gửi API với FormData
      const response = await registerOrganizationApi(roleType as OrgType, formData as any);
      console.log("eeeeeeeeeeeee", response)
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