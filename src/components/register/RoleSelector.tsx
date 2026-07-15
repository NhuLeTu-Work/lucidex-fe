import { ChevronDown, UserPlus } from 'lucide-react';
import type { RegistrationRole } from '../../types/register';

interface RoleSelectorProps {
  roleType: RegistrationRole;
  handleRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isSuccess: boolean;
  getSubtitle: () => string;
  t: (k: string) => string;
}

export function RoleSelector({ roleType, handleRoleChange, isSuccess, getSubtitle, t }: RoleSelectorProps) {
  return (
    <div className="text-center flex flex-col gap-3">
      <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-1" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
        <UserPlus size={22} style={{ color: 'var(--ct-text)' }} />
      </div>
      
      <h2 className="font-display text-2xl font-semibold tracking-tight" style={{ color: 'var(--ct-text)' }}>
        {t('createAccountTitle') || 'Create an Account'}
      </h2>

      <div className="relative w-48 mx-auto">
        <select
          value={roleType}
          onChange={handleRoleChange}
          disabled={isSuccess}
          className="w-full appearance-none px-4 py-2 text-sm font-semibold rounded-lg border outline-none cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
        >
          <option value="owner">{t('roleOwner') || 'Credential Owner'}</option>
          <option value="issuer">{t('roleIssuer') || 'Issuer'}</option>
          <option value="verifier">{t('roleVerifier') || 'Verifier'}</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 opacity-50 pointer-events-none" size={16} style={{ color: 'var(--ct-text)' }}/>
      </div>

      <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
        {getSubtitle()}
      </p>
    </div>
  );
}