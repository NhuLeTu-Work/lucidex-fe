import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Clock, Building2, User, Hash, FileText } from 'lucide-react';
import { mockCredentials, mockStudents } from '../data/mockData';
import type { AppContextType } from '../App';

export function VerifyLinkPage({ ctx }: { ctx: AppContextType }) {
  const { t, setPage } = ctx;
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'consent_required'>('idle');
  const [verifiedData, setVerifiedData] = useState<any>(null);

  const handleCheck = () => {
    if (!code.trim()) return;
    setResult('checking');
    setTimeout(() => {
      // Mock: "abc123" hoặc "def456" hoặc "jkl012" thì valid
      if (['abc123', 'def456', 'jkl012', 'ghi789'].includes(code.trim())) {
        const cred = mockCredentials.find(c => {
          if (code.trim() === 'abc123') return c.id === 'cred_001';
          if (code.trim() === 'def456') return c.id === 'cred_001';
          if (code.trim() === 'ghi789') return c.id === 'cred_002';
          if (code.trim() === 'jkl012') return c.id === 'cred_004';
          return false;
        });
        const student = mockStudents.find(s => s.studentId === cred?.studentId);
        setVerifiedData({ ...cred, studentName: student?.name, major: student?.major, graduationYear: student?.graduationYear, gpa: student?.gpa, honors: student?.honors });
        setResult('valid');
      } else if (code.trim() === 'no_consent') {
        setResult('consent_required');
      } else {
        setResult('invalid');
      }
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <button onClick={() => setPage('landing')} className="flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70" style={{ color: 'var(--ct-text-secondary)' }}>
          <ArrowLeft size={16} />
          {ctx.t('cancel')}
        </button>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">{t('verifyPageTitle')}</h1>
          <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('enterLinkCode')}</p>
        </div>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="abc123"
            className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-black"
            style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
          />
          <button onClick={handleCheck} disabled={!code.trim() || result === 'checking'} className="px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-80 disabled:opacity-40" style={{ background: '#000' }}>
            {result === 'checking' ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="flex items-center gap-1"><Search size={14} /> {t('check')}</span>}
          </button>
        </div>

        {/* Hint */}
        {result === 'idle' && (
          <div className="p-4 rounded-xl border text-xs" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)', color: 'var(--ct-text-secondary)' }}>
            <p className="mb-2 font-semibold">{ctx.lang === 'vi' ? 'Thu cac ma sau:' : 'Try these codes:'}</p>
            <div className="flex flex-wrap gap-2">
              {['abc123', 'def456', 'ghi789', 'jkl012', 'no_consent', 'invalid'].map(c => (
                <button key={c} onClick={() => setCode(c)} className="px-2 py-1 rounded border text-xs font-mono hover:opacity-70 transition-opacity" style={{ borderColor: 'var(--ct-border)' }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result === 'valid' && verifiedData && (
          <div className="rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-green-700">{t('credentialValid')}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><User size={14} className="opacity-50" /> <span className="font-medium">{t('studentName')}:</span> <span className="font-semibold">{verifiedData.studentName}</span></div>
              <div className="flex items-center gap-2"><Building2 size={14} className="opacity-50" /> <span className="font-medium">{t('institution')}:</span> <span>CICT - Can Tho University</span></div>
              <div className="flex items-center gap-2"><FileText size={14} className="opacity-50" /> <span className="font-medium">{t('degreeType')}:</span> <span>{verifiedData.degreeType}</span></div>
              <div className="flex items-center gap-2"><Hash size={14} className="opacity-50" /> <span className="font-medium">{t('major')}:</span> <span>{verifiedData.major}</span></div>
              <div className="flex items-center gap-2"><Clock size={14} className="opacity-50" /> <span className="font-medium">{t('issueDate')}:</span> <span>{verifiedData.issueDate}</span></div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <span className="font-mono text-xs opacity-60">{t('verificationId')}: verify_{Date.now()}</span>
              </div>
            </div>
          </div>
        )}

        {result === 'invalid' && (
          <div className="rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red)' }}>
            <div className="flex items-center gap-2">
              <XCircle size={20} className="text-red-600" />
              <span className="font-semibold text-red-700">{t('credentialInvalid')}</span>
            </div>
          </div>
        )}

        {result === 'consent_required' && (
          <div className="rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ borderColor: '#f59e0b', background: 'var(--ct-accent-amber)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-amber-600" />
              <span className="font-semibold text-amber-700">{t('consentRequired')}</span>
            </div>
            <p className="text-sm text-amber-700 opacity-80">{t('contactStudent')}</p>
          </div>
        )}
      </div>
    </div>
  );
}


