import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, History, BarChart3, FileText, Building2,
  CheckCircle, XCircle, Search, ArrowRight, ChevronRight,
  Upload, Star, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { currentHR, mockHRVerifyHistory, mockCredentials, mockStudents } from '../data/mockData';
import type { AppContextType } from '../App';

type HRTab = 'dashboard' | 'history' | 'quota' | 'verify' | 'register';

export function HRPortal({ ctx }: { ctx: AppContextType }) {
  const { t } = ctx;
  const [activeTab, setActiveTab] = useState<HRTab>('dashboard');
  const [quotaUsed, setQuotaUsed] = useState(currentHR.quotaUsed);
  const [verifyResult, setVerifyResult] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [verifiedData, setVerifiedData] = useState<any>(null);

  const sidebarItems = [
    { id: 'dashboard' as HRTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'verify' as HRTab, label: t('verifyCredential'), icon: <Search size={18} /> },
    { id: 'history' as HRTab, label: t('verifyHistory'), icon: <History size={18} /> },
    { id: 'quota' as HRTab, label: t('quotaPlan'), icon: <BarChart3 size={18} /> },
    { id: 'register' as HRTab, label: t('orgRegistration'), icon: <Building2 size={18} /> },
  ];

  const handleVerify = (code: string) => {
    setVerifyResult('checking');
    setTimeout(() => {
      if (['abc123', 'def456', 'ghi789', 'jkl012'].includes(code.trim())) {
        const cred = mockCredentials.find(c => {
          if (code.trim() === 'abc123') return c.id === 'cred_001';
          if (code.trim() === 'def456') return c.id === 'cred_001';
          if (code.trim() === 'ghi789') return c.id === 'cred_002';
          if (code.trim() === 'jkl012') return c.id === 'cred_004';
          return false;
        });
        const student = mockStudents.find(s => s.studentId === cred?.studentId);
        setVerifiedData({ ...cred, studentName: student?.name, major: student?.major, graduationYear: student?.graduationYear, gpa: student?.gpa, honors: student?.honors });
        setVerifyResult('valid');
        setQuotaUsed(prev => Math.min(prev + 1, 20));
      } else {
        setVerifyResult('invalid');
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
              {currentHR.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{currentHR.name}</p>
              <p className="text-xs opacity-60">{currentHR.company}</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60 hover:opacity-100'}`} style={{ background: activeTab === item.id ? '#000' : 'transparent' }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        {/* Quota mini */}
        <div className="p-4 mt-auto border-t" style={{ borderColor: 'var(--ct-border)' }}>
          <p className="text-xs font-medium mb-2">{t('freeTier')}</p>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ct-border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(quotaUsed / 20) * 100}%`, background: quotaUsed >= 20 ? '#ef4444' : '#000' }} />
          </div>
          <p className="text-xs mt-1 opacity-60">{quotaUsed}/20 {t('used')}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60'}`} style={{ background: activeTab === item.id ? '#000' : 'var(--ct-surface)' }}>
              {item.icon}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <HRDashboard t={t} quotaUsed={quotaUsed} onTabChange={setActiveTab} />}
        {activeTab === 'verify' && <HRVerify t={t} result={verifyResult} verifiedData={verifiedData} onVerify={handleVerify} quotaUsed={quotaUsed} />}
        {activeTab === 'history' && <HRHistory t={t} />}
        {activeTab === 'quota' && <HRQuota t={t} quotaUsed={quotaUsed} />}
        {activeTab === 'register' && <HRRegister t={t} />}
      </main>
    </div>
  );
}

/* ========================= DASHBOARD ========================= */
function HRDashboard({ t, quotaUsed, onTabChange }: { t: (k: string) => string; quotaUsed: number; onTabChange: (t: HRTab) => void }) {
  const remaining = 20 - quotaUsed;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeHR')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{currentHR.company} — {t('mockDataLabel')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label={t('verificationsUsed')} value={`${quotaUsed}/20`} icon={<BarChart3 size={20} />} onClick={() => onTabChange('quota')} />
        <StatCard label={t('verifyHistory')} value={mockHRVerifyHistory.length.toString()} icon={<History size={20} />} onClick={() => onTabChange('history')} />
        <StatCard label={t('verifyCredential')} value="+" icon={<Search size={20} />} onClick={() => onTabChange('verify')} />
      </div>

      {/* Quick Verify */}
      <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verifyCredential')}</h3>
        <div className="flex gap-3">
          <input type="text" placeholder="abc123" className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button onClick={() => onTabChange('verify')} className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50">{remaining} {t('remaining')}</p>
      </div>

      {/* Recent Verifications */}
      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('verifyHistory')}</h3>
          <button onClick={() => onTabChange('history')} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100"><ChevronRight size={12} /></button>
        </div>
        <div className="space-y-2">
          {mockHRVerifyHistory.slice(0, 3).map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--ct-border)' }}>
              <div className="flex items-center gap-3">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-sm">{h.studentName}</span>
              </div>
              <span className="text-xs font-mono opacity-50">{new Date(h.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================= VERIFY (with drag & snap) ========================= */
function HRVerify({ t, result, verifiedData, onVerify, quotaUsed }: { t: (k: string) => string; result: string; verifiedData: any; onVerify: (code: string) => void; quotaUsed: number }) {
  const [code, setCode] = useState('');
  const [showStampArea, setShowStampArea] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const dropCenter = useRef({ x: 0, y: 0 });
  const stampCenter = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const hasVerified = useRef(false);

  const getPositions = useCallback(() => {
    if (!dropZoneRef.current || !stampRef.current) return;
    const dropRect = dropZoneRef.current.getBoundingClientRect();
    const stampRect = stampRef.current.getBoundingClientRect();
    dropCenter.current = { x: dropRect.left + dropRect.width / 2, y: dropRect.top + dropRect.height / 2 };
    stampCenter.current = { x: stampRect.left + stampRect.width / 2, y: stampRect.top + stampRect.height / 2 };
  }, []);

  const animate = useCallback(() => {
    if (!stampRef.current) return;
    const rect = stampRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    currentPos.current.x += (targetPos.current.x - cx) * 0.15;
    currentPos.current.y += (targetPos.current.y - cy) * 0.15;
    stampRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
    const dist = Math.hypot(dropCenter.current.x - cx, dropCenter.current.y - cy);
    if (dist < 100 && !hasVerified.current && guideRef.current) {
      const gx = dropCenter.current.x - stampCenter.current.x;
      const gy = dropCenter.current.y - stampCenter.current.y;
      guideRef.current.style.transform = `translate(${gx}px, ${gy}px)`;
      guideRef.current.style.opacity = '1';
    }
    if (dist > 150 && guideRef.current) guideRef.current.style.opacity = '0';
    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [animate]);

  const handleMouseDown = () => {
    isDragging.current = true;
    stampRef.current?.classList.add('dragging');
    getPositions();
    const dist = Math.hypot(dropCenter.current.x - stampCenter.current.x, dropCenter.current.y - stampCenter.current.y);
    if (dist < 50) {
      offset.current = { x: stampCenter.current.x - dropCenter.current.x, y: stampCenter.current.y - dropCenter.current.y };
    } else {
      offset.current = { x: 0, y: 0 };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    stampRef.current?.classList.remove('dragging');
    getPositions();
    const dist = Math.hypot(dropCenter.current.x - stampCenter.current.x, dropCenter.current.y - stampCenter.current.y);
    if (dist < 50) {
      targetPos.current = { x: dropCenter.current.x - stampCenter.current.x + offset.current.x, y: dropCenter.current.y - stampCenter.current.y + offset.current.y };
      dropZoneRef.current?.classList.add('verified');
      hasVerified.current = true;
      if (guideRef.current) guideRef.current.style.opacity = '0';
    } else {
      dropZoneRef.current?.classList.remove('verified');
      hasVerified.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    targetPos.current = { x: e.clientX + offset.current.x, y: e.clientY + offset.current.y };
  };

  const handleCheck = () => {
    if (!code.trim()) return;
    onVerify(code);
    setShowStampArea(true);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('verifyCredential')}</h1>

      {quotaUsed >= 20 && (
        <div className="p-4 rounded-xl border mb-6" style={{ borderColor: '#f59e0b', background: 'var(--ct-accent-amber)' }}>
          <p className="text-sm text-amber-700">{t('quotaExceeded')}</p>
        </div>
      )}

      <div className="max-w-lg mb-8">
        <div className="flex gap-2">
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="abc123" className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button onClick={handleCheck} disabled={!code.trim() || quotaUsed >= 20} className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80 disabled:opacity-40" style={{ background: '#000' }}>
            {result === 'checking' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('check')}
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50">{t('mockDataLabel')} — Try: abc123, def456, ghi789, jkl012</p>
      </div>

      {/* Stamp Verification Area */}
      {showStampArea && result === 'valid' && verifiedData && (
        <div className="relative select-none" style={{ height: '400px' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <p className="text-sm mb-4 opacity-60">Drag the VERIFIED stamp onto the credential document below:</p>

          {/* Document */}
          <div ref={dropZoneRef} className="drop-zone absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 rounded-xl" style={{ background: 'var(--ct-surface)' }}>
            <div className="text-center">
              <Shield size={24} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">{verifiedData.studentName}</p>
              <p className="text-xs opacity-60">{verifiedData.degreeType}</p>
              <p className="text-xs font-mono opacity-40 mt-1">{verifiedData.hash}</p>
            </div>
          </div>

          {/* Guide */}
          <div ref={guideRef} className="stamp-guide absolute w-[80px] h-[80px] rounded-full" style={{ top: '50%', left: '50%', marginLeft: '-40px', marginTop: '-40px', opacity: 0 }} />

          {/* Stamp */}
          <div ref={stampRef} className="stamp-element absolute" style={{ top: '20px', left: '20px' }} onMouseDown={handleMouseDown}>
            <div className="w-[80px] h-[80px] rounded-full border-4 border-black flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
              <span className="text-white text-[8px] font-black tracking-widest text-center leading-tight">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result === 'valid' && verifiedData && (
        <div className="mt-8 p-6 rounded-2xl border animate-in fade-in" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-semibold text-green-700">{t('credentialValid')}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="opacity-50">{t('studentName')}:</span> <span className="font-semibold">{verifiedData.studentName}</span></div>
            <div><span className="opacity-50">{t('institution')}:</span> <span>CICT - Can Tho University</span></div>
            <div><span className="opacity-50">{t('degreeType')}:</span> <span>{verifiedData.degreeType}</span></div>
            <div><span className="opacity-50">GPA:</span> <span>{verifiedData.gpa}</span></div>
          </div>
        </div>
      )}

      {result === 'invalid' && (
        <div className="mt-8 p-6 rounded-2xl border animate-in fade-in" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red)' }}>
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />
            <span className="font-semibold text-red-700">{t('credentialInvalid')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= HISTORY ========================= */
function HRHistory({ t }: { t: (k: string) => string }) {
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('verifyHistory')}</h1>
      {mockHRVerifyHistory.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noVerifyHistory')}</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)' }}>
                <th className="text-left px-4 py-3 font-medium">{t('date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('studentName')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('institution')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {mockHRVerifyHistory.map(h => (
                <tr key={h.id} className="border-t transition-colors hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{h.studentName}</td>
                  <td className="px-4 py-3 text-xs">{h.institution}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.result === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.result === 'valid' ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <FileText size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ========================= QUOTA ========================= */
function HRQuota({ t, quotaUsed }: { t: (k: string) => string; quotaUsed: number }) {
  const pct = (quotaUsed / 20) * 100;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('quotaPlan')}</h1>

      <div className="max-w-lg p-8 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="text-center mb-6">
          <p className="text-sm opacity-60">{t('freeTier')}</p>
          <p className="font-display text-5xl mt-2">{quotaUsed}<span className="text-2xl opacity-30">/20</span></p>
          <p className="text-xs mt-2 opacity-50">{20 - quotaUsed} {t('remaining')}</p>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-6" style={{ background: 'var(--ct-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : '#000' }} />
        </div>

        {pct >= 90 && (
          <button className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Star size={16} className="inline mr-2" />
            {t('upgradePlan')}
          </button>
        )}
      </div>

      {/* Usage Chart */}
      <div className="mt-8 p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verificationsUsed')}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[{ name: 'Mon', v: 2 }, { name: 'Tue', v: 4 }, { name: 'Wed', v: 3 }, { name: 'Thu', v: 1 }, { name: 'Fri', v: 5 }, { name: 'Sat', v: 2 }, { name: 'Sun', v: 1 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
            <XAxis dataKey="name" stroke="var(--ct-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
            <Bar dataKey="v" fill="#000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ========================= REGISTER ========================= */
function HRRegister({ t }: { t: (k: string) => string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('orgRegistration')}</h1>

      {submitted ? (
        <div className="max-w-lg p-8 rounded-2xl border text-center" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
          <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="font-display text-xl mb-2">{t('regSuccess')}</h3>
          <p className="text-sm opacity-60">Status: {t('pending')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('orgName')}</label>
                <input type="text" required placeholder="Cong ty TNHH ABC" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('taxId')}</label>
                <input type="text" required placeholder="0123456789" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('businessLicense')}</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <Upload size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('uploadLicense')}</p>
                  <p className="text-xs mt-1 opacity-50">PDF, JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Shield size={16} className="inline mr-2" />
            {t('submitForApproval')}
          </button>
        </form>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, onClick }: { label: string; value: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] group" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: 'var(--ct-text-secondary)' }}>{icon}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--ct-text-secondary)' }} />
      </div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--ct-text-secondary)' }}>{label}</p>
    </button>
  );
}
