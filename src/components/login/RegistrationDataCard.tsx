import type { Account } from '../../data/mockData';

export function RegistrationDataCard({ data, t }: { data: NonNullable<Account['registrationData']>; t: (k: string) => string }) {
  return (
    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2 p-4 rounded-xl border text-left" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
      <div className="col-span-2 flex justify-between border-b pb-2 mb-1" style={{ borderColor: 'var(--ct-border)' }}>
        <span className="opacity-60">{t('submittedAt') || 'Submitted At'}:</span>
        <span className="font-mono">{new Date(data.submittedAt).toLocaleString()}</span>
      </div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblOrgName') || 'Organization'}:</span><span className="font-medium">{data.orgName}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblTaxCode') || 'Tax Code'}:</span><span className="font-medium">{data.taxCode}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblRegName') || 'Registrant'}:</span><span className="font-medium">{data.regName}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblContactPhone') || 'Phone'}:</span><span className="font-medium">{data.contactPhone}</span></div>
    </div>
  );
}