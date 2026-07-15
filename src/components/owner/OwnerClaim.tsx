import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import type { ClaimStep } from '../../types/owner';

interface OwnerClaimProps {
  t: (k: string) => string;
  step: ClaimStep;
  setStep: (s: ClaimStep) => void;
  otpValue: string;
  setOtpValue: (v: string) => void;
  showOtpMock: boolean;
  setShowOtpMock: (v: boolean) => void;
}

export function OwnerClaim({ t, step, setStep, otpValue, setOtpValue, showOtpMock, setShowOtpMock }: OwnerClaimProps) {
  const [studentId, setStudentId] = useState('');
  const [dob, setDob] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  const handleRequestOTP = () => {
    if (!studentId || !dob) return;
    setShowOtpMock(true);
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    if (otpValue === '123456') {
      setStep('success');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('claimYourDegree')}</h1>

      {step === 'form' && (
        <div className="max-w-md">
          <div className="p-6 rounded-2xl border mb-6" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('studentId')}</label>
                <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="B190001" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('enterDob')}</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <button onClick={handleRequestOTP} disabled={!studentId || !dob} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80 disabled:opacity-40" style={{ background: '#000' }}>
                {t('requestOTP')}
              </button>
            </div>
          </div>

          <button onClick={() => setShowFallback(!showFallback)} className="text-sm underline opacity-60 hover:opacity-100 transition-opacity">{t('fallbackTitle')}</button>
          {showFallback && (
            <div className="mt-4 p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-accent-amber)' }}>
              <p className="text-sm mb-4">{t('fallbackDesc')}</p>
              <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                <Upload size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">{t('uploadCCCD')}</p>
                <p className="text-xs mt-1 opacity-50">{t('cccdNote')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'otp' && (
        <div className="max-w-md">
          <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
            <p className="text-sm mb-4">{t('otpSent')}</p>
            {showOtpMock && (
              <div className="p-3 rounded-lg mb-4 text-center font-mono text-lg font-bold tracking-widest" style={{ background: 'var(--ct-accent-green)' }}>
                123456
                <p className="text-xs font-normal mt-1 opacity-60">[MOCK OTP - Auto-displayed for demo]</p>
              </div>
            )}
            <input type="text" value={otpValue} onChange={e => setOtpValue(e.target.value)} placeholder="000000" maxLength={6} className="w-full px-4 py-2.5 rounded-lg border text-sm text-center font-mono tracking-[0.5em] outline-none mb-4" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
            <button onClick={handleVerifyOTP} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
              {t('verify')}
            </button>
            <button onClick={() => setShowOtpMock(true)} className="w-full mt-2 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity">{t('resendOTP')}</button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-md">
          <div className="p-8 rounded-2xl border text-center" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
            <h3 className="font-display text-xl mb-2">{t('claimSuccess')}</h3>
            <p className="text-sm opacity-70 mb-4">B190001 — Nguyen Van A</p>
            <button onClick={() => setStep('form')} className="px-6 py-2 text-sm font-semibold rounded-xl border transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-text)' }}>
              {t('createVerifiedLink')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}