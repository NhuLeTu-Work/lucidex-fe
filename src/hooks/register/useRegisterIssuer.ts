// src/hooks/register/useRegisterIssuer.ts
// import { useState } from 'react';
import { registerIssuerApi } from '@/api/endpoints/issuer/registerIssuerApi';
import type { RegisterState } from './types'; // Giữ nguyên các types cũ của bạn

export function useRegisterIssuer(state: RegisterState, t: any) {
  const {
    bizData, setFieldErrors, setError, 
    setMissingFieldKeys, certificate, setIsLoading, setIsSuccess
  } = state;

  const handleRegister = async () => {
    // 1. Reset trạng thái lỗi
    setError(null);
    setFieldErrors({});
    setMissingFieldKeys([]);

    // 2. Validate dữ liệu cơ bản (Tránh gửi request rỗng)
    const fErrors: Record<string, string> = {};
    if (!/^\d{10}$/.test(bizData.taxCode)) fErrors.taxCode = t('fmtTaxCode');
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(bizData.email)) fErrors.email = t('fmtGmail');
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(bizData.phone)) fErrors.phone = t('fmtPhone');
    
    if (Object.keys(fErrors).length > 0) {
      setFieldErrors(fErrors);
      setError('errorInvalidFields');
      return;
    }

    if (!certificate) {
      setError('errorMissingDocument');
      return;
    }

    // 3. Chuẩn bị Payload cho Multipart/Form-data
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

      // 4. Gọi API
      const response = await registerIssuerApi(payload);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('Dữ liệu không hợp lệ, vui lòng kiểm tra lại.');
      } else {
        setError(err.response?.data?.message || 'Lỗi kết nối máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister };
}