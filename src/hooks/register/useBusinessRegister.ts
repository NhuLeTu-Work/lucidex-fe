import { registerOrganizationApi } from '@/api/endpoints/business/registerOrganizationApi';
import type { RegisterState, BusinessData } from './types';
import type { OrgType } from '../../api/types/business.types';

export function useBusinessRegister( state: RegisterState ) {
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

    // 1. KIỂM TRA FORMAT (Đồng bộ với Backend)
    const fErrors: Record<string, string> = {};
    const nameRegex = /^[\p{L}\s]+$/u; 
    if (roleType === 'issuer') {
      if (bizData.orgName.length < 2 || bizData.orgName.length > 255) {
        fErrors.orgName = 'fmtInstNameLength';
      }
    } else {
      if (bizData.orgName.length < 3 || bizData.orgName.length > 200) {
        fErrors.orgName = 'fmtTextLength';
      }
    }
    
    if (!/^\d{10}(?:-\d{3})?$/.test(bizData.taxCode.trim())) {
      fErrors.taxCode = 'fmtTaxCode'; // CHỈ LƯU KEY
    }
    
    if (bizData.address.length < 1 || bizData.address.length > 500) {
      fErrors.address = 'fmtTextLength'; // CHỈ LƯU KEY
    }

    if (roleType === 'verifier' && (bizData.regTitle.length < 3 || bizData.regTitle.length > 200)) {
      fErrors.regTitle = 'fmtTextLength'; // CHỈ LƯU KEY
    }
    
    if (roleType === 'issuer') {
      if (bizData.legalRep.length < 2 || bizData.legalRep.length > 255 || !nameRegex.test(bizData.legalRep.trim())) {
        fErrors.legalRep = 'fmtNameLettersOnly';
      }
    } else {
      if (bizData.legalRep.length < 3 || bizData.legalRep.length > 200) {
        fErrors.legalRep = 'fmtTextLength';
      }
    }
    
    const emailRegex = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
    if (!emailRegex.test(bizData.email.trim())) {
      fErrors.email = 'fmtEmail'; // CHỈ LƯU KEY
    }
    
    const normalizedPhone = bizData.phone.replace(/[\s.()]/g, '');
    if (!/^0(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      fErrors.phone = 'fmtPhone'; // CHỈ LƯU KEY
    }
    
    if (roleType === 'issuer') {
      if (bizData.regName.length < 2 || bizData.regName.length > 255 || !nameRegex.test(bizData.regName.trim())) {
        fErrors.regName = 'fmtNameLettersOnly';
      }
    } else {
      if (bizData.regName.length < 3 || bizData.regName.length > 200) {
        fErrors.regName = 'fmtTextLength';
      }
    }

    if (Object.keys(fErrors).length > 0) {
      setFieldErrors(fErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // 2. TẠO PAYLOAD VÀ MAP KEY
      const formData = new FormData();
      formData.append('name', bizData.orgName);
      formData.append('tax_code', bizData.taxCode.trim());
      formData.append('address', bizData.address);
      formData.append('legal_rep_name', bizData.legalRep);
      formData.append('contact_email', bizData.email.trim());
      formData.append('contact_phone', normalizedPhone); // Gửi số điện thoại đã làm sạch
      formData.append('registrant_name', bizData.regName);
      
      if (roleType === 'verifier' && bizData.regTitle) {
        formData.append('registrant_title', bizData.regTitle);
      }

      if (certificate) {
        formData.append('document', certificate);
      }
      const response = await registerOrganizationApi(roleType as OrgType, formData as any);
      if (response && response.success) {
        setIsSuccess(true);
      } else if (response) {
        setError(response.message || 'errorRegistrationFailed');
      }
      
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setError('errorInvalidData');
        console.log('Validation Error Details:', err.response.data.detail);
      } else if (err.response?.status === 400 || err.response?.status === 409) {
        setError('errorEmailExists');
      } else {
        setError('errorServerConnection');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleBizChange, handleBizRegister };
}