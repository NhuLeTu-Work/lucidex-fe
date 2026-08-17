import { useState } from 'react';
import { XCircle } from 'lucide-react';
import type { VerifyResultState, VerifiedData } from '../../types/verifier';
import { mapOwnerCredentialToCertificateData } from '../certificates/ctuGraduation/certificateData';
import GraduationCertificate from '../certificates/ctuGraduation/GraduationCertificate';
import { CredentialCoverReveal } from '../certificates/CredentialCoverReveal';
import { VerifierBulkVerify } from './VerifierBulkVerify';

interface VerifyProps {
  t: (k: string) => string;
  result: VerifyResultState;
  verifiedData: VerifiedData | null;
  rawCredentialData?: any;
  onVerify: (code: string) => void;
  quotaUsed: number;
  showToast?: (type: 'success' | 'error' | 'warning', msg: string) => void;
}

export function VerifierVerify({ t, result, rawCredentialData, onVerify, quotaUsed, showToast }: VerifyProps) {
  const [code, setCode] = useState('');
  const [subTab, setSubTab] = useState<'single' | 'bulk'>('single');

  const handleCheck = () => {
    if (!code.trim()) return;
    onVerify(code);
  };

  const certData = rawCredentialData ? mapOwnerCredentialToCertificateData(rawCredentialData) : null;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('verifyCredential')}</h1>

      {/* 2 Tab bên cạnh nhau: Xác thực đơn / Xác thực hàng loạt (CSV) */}
      <div className="flex border-b mb-6 border-[var(--ct-border)]">
        <button
          type="button"
          onClick={() => setSubTab('single')}
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${
            subTab === 'single' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'
          }`}
        >
          Xác thực đơn
        </button>

        <button
          type="button"
          onClick={() => setSubTab('bulk')}
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 text-[var(--ct-text)] ${
            subTab === 'bulk' ? 'opacity-100 border-[var(--ct-text)]' : 'border-transparent opacity-50 hover:opacity-80'
          }`}
        >
          Xác thực hàng loạt (CSV)
        </button>
      </div>

      {/* TAB 1: SINGLE VERIFY CODE - KHÔNG THAY ĐỔI GÌ HẾT */}
      {subTab === 'single' && (
        <>
          {/* Form nhập mã */}
          <div className="max-w-lg mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Nhập mã chia sẻ..."
                className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none"
                style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
              />
              <button
                onClick={handleCheck}
                disabled={!code.trim()}
                className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
                style={{ background: '#000' }}
              >
                {result === 'checking' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('check')}
              </button>
            </div>
          </div>

          {/* Thất bại */}
          {result === 'invalid' && (
            <div className="p-6 rounded-2xl border animate-in fade-in" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red)' }}>
              <div className="flex items-center gap-2">
                <XCircle size={20} className="text-red-600" />
                <span className="font-semibold text-red-700">{t('credentialInvalid')}</span>
              </div>
            </div>
          )}

          {/* Thành công: Hiển thị trực tiếp bản Web 2 trang song song (không cần chuyển trang) */}
          {result === 'valid' && certData && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative w-full max-w-5xl aspect-[1640/1200] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center my-2">
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <GraduationCertificate data={certData} />
                </div>
                <CredentialCoverReveal
                  logoUrl={certData.logoUrl || '/ctuGraduation/ctuLogo.png'}
                  title="BẰNG TỐT NGHIỆP"
                  subtitle="CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: BULK VERIFY (CSV) */}
      {subTab === 'bulk' && (
        <VerifierBulkVerify
          showToast={showToast}
          quotaUsed={quotaUsed}
        />
      )}
    </div>
  );
}