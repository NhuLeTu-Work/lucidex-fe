import { useRef } from 'react';
import { Building2, Hash, MapPin, User, Mail, Phone, Briefcase, Upload, ShieldCheck } from 'lucide-react';
import type { RegistrationRole, BusinessData } from '../../types/register';

interface BusinessFormProps {
  roleType: RegistrationRole;
  bizData: BusinessData;
  fieldErrors: Record<string, string>;
  isLoading: boolean;
  certificate: File | null;
  setCertificate: (f: File | null) => void;
  handleBizChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBizRegister: (e: React.FormEvent) => void;
  t: (k: string) => string;
}

export function BusinessRegisterForm({
  roleType, bizData, fieldErrors, isLoading, certificate, setCertificate, handleBizChange, handleBizRegister, t
}: BusinessFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderBizField = (name: string, labelKey: string, Icon: React.ElementType, placeholder: string) => (
    <div className="flex flex-col gap-1.5" key={name}>
      <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
        {t(labelKey) || placeholder}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Icon size={16} /></span>
        <input
          name={name}
          value={bizData[name as keyof BusinessData]}
          onChange={handleBizChange}
          disabled={isLoading}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all disabled:opacity-50 ${fieldErrors[name] ? 'border-red-500 focus:border-red-500' : 'focus:border-neutral-400'}`}
          style={{ background: 'var(--ct-bg)', borderColor: fieldErrors[name] ? '#ef4444' : 'var(--ct-border)', color: 'var(--ct-text)' }}
        />
      </div>
      {fieldErrors[name] && <span className="text-[11px] text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">{fieldErrors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleBizRegister} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderBizField('orgName', roleType === 'verifier' ? 'lblOrgName' : 'lblInstName', Building2, 'FPT Software / CTU')}
        {renderBizField('taxCode', 'lblTaxCode', Hash, '1234567890')}
        {renderBizField('address', 'lblAddress', MapPin, '123 Example St, City')}
        {renderBizField('legalRep', 'lblLegalRep', User, 'Nguyen Van A')}
        {renderBizField('email', 'lblContactGmail', Mail, 'contact@gmail.com')}
        {renderBizField('phone', 'lblContactPhone', Phone, '0987654321')}
        {renderBizField('regName', 'lblRegName', User, 'Tran Thi B')}
        {roleType === 'verifier' && renderBizField('regTitle', 'lblRegTitle', Briefcase, 'HR Manager')}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
          {roleType === 'verifier' ? (t('uploadCert') || 'Business registration certificate') : (t('uploadCertIssuer') || 'Business registration certificate')}
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${fieldErrors['certificate'] ? 'border-red-500 bg-red-50/10' : ''}`}
          style={{ borderColor: fieldErrors['certificate'] ? '#ef4444' : 'var(--ct-border)' }}
        >
          <Upload size={24} className="opacity-40" style={{ color: 'var(--ct-text)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--ct-text)' }}>
            {certificate ? certificate.name : (t('clickToUpload') || 'Click to upload certificate')}
          </span>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCertificate(e.target.files[0]);
                if (fieldErrors['certificate']) fieldErrors['certificate'] = '';
              }
            }}
          />
        </div>
        {fieldErrors['certificate'] && <span className="text-[11px] text-red-500 font-medium ml-1">{t(fieldErrors['certificate'])}</span>}
      </div>

      <button type="submit" disabled={isLoading} className="w-full py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
        {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><ShieldCheck size={16} /><span>{t('submitForReview') || 'Submit Application'}</span></>}
      </button>
    </form>
  );
}