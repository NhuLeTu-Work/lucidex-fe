import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Link2, ClipboardList, Settings, Award,
  Plus, Trash2, ChevronRight, X, CheckCircle,
  Upload
} from 'lucide-react';
import { mockCredentials, mockVerifiedLinks, mockAuditLog, currentStudent } from '../data/mockData';
import type { AppContextType } from '../App';
import type { VerifiedLink } from '../data/mockData';

type StudentTab = 'dashboard' | 'credentials' | 'links' | 'audit' | 'consent' | 'claim';

export function StudentPortal({ ctx }: { ctx: AppContextType }) {
  const { t } = ctx;
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [links, setLinks] = useState<VerifiedLink[]>(mockVerifiedLinks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [claimStep, setClaimStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpValue, setOtpValue] = useState('');
  const [showOtpMock, setShowOtpMock] = useState(false);

  const sidebarItems: { id: StudentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'credentials', label: t('myCredentials'), icon: <FileText size={18} /> },
    { id: 'links', label: t('verifiedLinks'), icon: <Link2 size={18} /> },
    { id: 'audit', label: t('auditLog'), icon: <ClipboardList size={18} /> },
    { id: 'consent', label: t('consentSettings'), icon: <Settings size={18} /> },
    { id: 'claim', label: t('claimDegree'), icon: <Award size={18} /> },
  ];

  const handleRevokeLink = (linkId: string) => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, status: 'revoked' as const, revokedAt: new Date().toISOString() } : l));
  };

  const handleCreateLink = (expiry: string, consentType: string) => {
    const newLink: VerifiedLink = {
      id: `link_${Date.now()}`,
      credentialId: 'cred_001',
      url: `https://lucidex.ctu.edu.vn/v/${Math.random().toString(36).substring(7)}`,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiryLabel: expiry,
      consentType,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setLinks(prev => [newLink, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{currentStudent.name}</p>
              <p className="text-xs font-mono opacity-60">{currentStudent.studentId}</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Mobile tab bar */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60'}`} style={{ background: activeTab === item.id ? '#000' : 'var(--ct-surface)' }}>
              {item.icon}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <StudentDashboard t={t} links={links} onTabChange={setActiveTab} />}
        {activeTab === 'credentials' && <StudentCredentials t={t} />}
        {activeTab === 'links' && <StudentLinks t={t} links={links} onRevoke={handleRevokeLink} onCreate={() => setShowCreateModal(true)} />}
        {activeTab === 'audit' && <StudentAudit t={t} />}
        {activeTab === 'consent' && <StudentConsent t={t} />}
        {activeTab === 'claim' && <StudentClaim t={t} step={claimStep} setStep={setClaimStep} otpValue={otpValue} setOtpValue={setOtpValue} showOtpMock={showOtpMock} setShowOtpMock={setShowOtpMock} />}
      </main>

      {/* Create Link Modal */}
      {showCreateModal && <CreateLinkModal t={t} onClose={() => setShowCreateModal(false)} onCreate={handleCreateLink} />}
    </div>
  );
}

/* ========================= DASHBOARD ========================= */
function StudentDashboard({ t, links, onTabChange }: { t: (k: string) => string; links: VerifiedLink[]; onTabChange: (t: StudentTab) => void }) {
  const activeLinks = links.filter(l => l.status === 'active').length;
  const credCount = mockCredentials.filter(c => c.studentId === currentStudent.studentId).length;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeStudent')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('mockDataLabel')} — {t('phase1Label')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('myCredentials')} value={credCount.toString()} icon={<FileText size={20} />} onClick={() => onTabChange('credentials')} />
        <StatCard label={t('verifiedLinks')} value={activeLinks.toString()} icon={<Link2 size={20} />} onClick={() => onTabChange('links')} />
        <StatCard label={t('auditLog')} value={mockAuditLog.length.toString()} icon={<ClipboardList size={20} />} onClick={() => onTabChange('audit')} />
        <StatCard label={t('claimDegree')} value="+" icon={<Award size={20} />} onClick={() => onTabChange('claim')} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('createVerifiedLink')}</h3>
          <button onClick={() => onTabChange('links')} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Plus size={16} className="inline mr-2" />
            {t('createVerifiedLink')}
          </button>
        </div>
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('consentSettings')}</h3>
          <button onClick={() => onTabChange('consent')} className="w-full py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-text)', color: 'var(--ct-text)' }}>
            <Settings size={16} className="inline mr-2" />
            {t('consentSettings')}
          </button>
        </div>
      </div>
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

/* ========================= CREDENTIALS ========================= */
function StudentCredentials({ t }: { t: (k: string) => string }) {
  const myCreds = mockCredentials.filter(c => c.studentId === currentStudent.studentId);
  const student = currentStudent;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('myCredentials')}</h1>
      {myCreds.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noCredentials')}</p>
      ) : (
        <div className="space-y-6">
          {myCreds.map(cred => (
            <TiltCredentialCard key={cred.id} cred={cred} student={student} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TiltCredentialCard({ cred, student, t }: { cred: any; student: any; t: (k: string) => string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

  const updateBounding = useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) boundingRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }, []);

  useEffect(() => {
    updateBounding();
    window.addEventListener('resize', updateBounding);
    return () => window.removeEventListener('resize', updateBounding);
  }, [updateBounding]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = boundingRef.current;
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const xPct = (mouseX / width) * 100;
    const yPct = (mouseY / height) * 100;
    const xNorm = (mouseX / width - 0.5) * 2;
    const yNorm = (mouseY / height - 0.5) * 2;
    const rotateX = yNorm * -10;
    const rotateY = xNorm * 10;
    if (cardRef.current) cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    if (glareRef.current) glareRef.current.style.background = `radial-gradient(circle at ${xPct}% ${yPct}%, rgba(255,255,255,0.3), transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    if (glareRef.current) glareRef.current.style.background = 'radial-gradient(circle, transparent, transparent)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card relative overflow-hidden rounded-2xl border p-8 max-w-2xl"
      style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
    >
      <div className="tilt-card-content relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-mono opacity-50 mb-1">{t('mockDataLabel')}</p>
            <h3 className="font-display text-xl">{t('degreeInfo')}</h3>
          </div>
          <div className="w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--ct-border)' }}>
            <Award size={20} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="opacity-50">{t('studentName')}:</span> <span className="font-semibold">{student.name}</span></div>
          <div><span className="opacity-50">{t('studentId')}:</span> <span className="font-mono">{student.studentId}</span></div>
          <div><span className="opacity-50">{t('degreeType')}:</span> <span>{cred.degreeType}</span></div>
          <div><span className="opacity-50">{t('major')}:</span> <span>{student.major}</span></div>
          <div><span className="opacity-50">{t('graduationYear')}:</span> <span>{student.graduationYear}</span></div>
          <div><span className="opacity-50">{t('classHonors')}:</span> <span>{student.honors}</span></div>
          <div><span className="opacity-50">GPA:</span> <span className="font-semibold">{student.gpa}</span></div>
          <div><span className="opacity-50">{t('issueDate')}:</span> <span>{cred.issueDate}</span></div>
        </div>
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--ct-border)' }}>
          <p className="text-xs font-mono opacity-40 break-all">Hash: {cred.hash}</p>
        </div>
      </div>
      <div ref={glareRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}

/* ========================= LINKS ========================= */
function StudentLinks({ t, links, onRevoke, onCreate }: { t: (k: string) => string; links: VerifiedLink[]; onRevoke: (id: string) => void; onCreate: () => void }) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">{t('verifiedLinks')}</h1>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          <Plus size={16} />
          {t('create')}
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noLinks')}</p>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className="p-5 rounded-xl border transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)', opacity: link.status === 'revoked' ? 0.6 : 1 }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${link.status === 'active' ? 'bg-green-100 text-green-700' : link.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {link.status === 'active' ? t('active') : link.status === 'revoked' ? t('revoked') : t('expired')}
                    </span>
                    <span className="text-xs opacity-50">{link.expiryLabel}</span>
                  </div>
                  <p className="text-sm font-mono truncate">{link.url}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                    <span>{t('consentType')}: {link.consentType}</span>
                    <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => navigator.clipboard?.writeText(link.url)} className="p-2 rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)' }} title="Copy">
                    <Link2 size={14} />
                  </button>
                  {link.status === 'active' && (
                    <button onClick={() => setRevokingId(link.id)} className="p-2 rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)', color: '#ef4444' }} title={t('revokeLink')}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Revoke Confirmation */}
              {revokingId === link.id && (
                <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: '#fecaca', background: 'var(--ct-accent-red)' }}>
                  <p className="text-sm mb-2">{t('revokeConfirm')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onRevoke(link.id); setRevokingId(null); }} className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors">{t('confirm')}</button>
                    <button onClick={() => setRevokingId(null)} className="px-3 py-1.5 text-xs rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)' }}>{t('cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= CREATE LINK MODAL ========================= */
function CreateLinkModal({ t, onClose, onCreate }: { t: (k: string) => string; onClose: () => void; onCreate: (expiry: string, consent: string) => void }) {
  const [expiry, setExpiry] = useState('7d');
  const [consent, setConsent] = useState('one_time');

  const expiryOptions = [
    { value: '24h', label: t('hours24') },
    { value: '7d', label: t('days7') },
    { value: '30d', label: t('days30') },
    { value: 'permanent', label: t('permanent') },
  ];

  const consentOptions = [
    { value: 'one_time', label: t('oneTimeConsent') },
    { value: 'per_request', label: t('perRequestConsent') },
    { value: 'org_level', label: t('orgLevelConsent') },
    { value: 'time_bound', label: t('timeBoundConsent') },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{t('createVerifiedLink')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70 transition-opacity"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">{t('linkExpiry')}</label>
          <div className="grid grid-cols-2 gap-2">
            {expiryOptions.map(opt => (
              <button key={opt.value} onClick={() => setExpiry(opt.value)} className={`px-3 py-2.5 rounded-lg text-sm border transition-all ${expiry === opt.value ? 'border-black font-semibold' : 'opacity-60'}`} style={{ background: expiry === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: expiry === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">{t('consentType')}</label>
          <div className="space-y-2">
            {consentOptions.map(opt => (
              <button key={opt.value} onClick={() => setConsent(opt.value)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex items-center gap-2 ${consent === opt.value ? 'border-black font-semibold' : 'opacity-60'}`} style={{ background: consent === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: consent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${consent === opt.value ? 'border-black' : ''}`} style={{ borderColor: consent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                  {consent === opt.value && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onCreate(expiry, consent)} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          {t('createVerifiedLink')}
        </button>
      </div>
    </div>
  );
}

/* ========================= AUDIT LOG ========================= */
function StudentAudit({ t }: { t: (k: string) => string }) {
  const myAudit = mockAuditLog.filter(a => mockCredentials.filter(c => c.studentId === currentStudent.studentId).some(c => c.id === a.credentialId));

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('auditLog')}</h1>
      {myAudit.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noAuditLogs')}</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)' }}>
                <th className="text-left px-4 py-3 font-medium">{t('date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('verifiedBy')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {myAudit.map(entry => (
                <tr key={entry.id} className="border-t transition-colors hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{entry.verifiedBy}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.status === 'success' ? 'Success' : 'Failed'}
                    </span>
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

/* ========================= CONSENT SETTINGS ========================= */
function StudentConsent({ t }: { t: (k: string) => string }) {
  const [defaultConsent, setDefaultConsent] = useState('per_request');
  const [autoApprove, setAutoApprove] = useState<string[]>(['TMA Solutions']);

  const consentOptions = [
    { value: 'one_time', label: t('oneTimeConsent'), desc: 'Dong y cho tung lan xac minh rieng le' },
    { value: 'per_request', label: t('perRequestConsent'), desc: 'Hoi lai moi khi co yeu cau xac minh' },
    { value: 'org_level', label: t('orgLevelConsent'), desc: 'Dong y 1 lan cho to chuc cu the' },
    { value: 'time_bound', label: t('timeBoundConsent'), desc: 'Dong y co thoi han tu chon' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('consentSettings')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('consentSettingsDesc')}</p>

      <div className="max-w-xl space-y-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('setDefaultConsent')}</h3>
          <div className="space-y-2">
            {consentOptions.map(opt => (
              <button key={opt.value} onClick={() => setDefaultConsent(opt.value)} className={`w-full text-left p-3 rounded-lg border transition-all ${defaultConsent === opt.value ? 'border-black' : 'opacity-70'}`} style={{ background: defaultConsent === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center`} style={{ borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                    {defaultConsent === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ct-text)' }} />}
                  </div>
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>
                <p className="text-xs mt-1 ml-6 opacity-60">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('autoApproveFor')}</h3>
          <div className="space-y-2">
            {['TMA Solutions', 'FPT Software', 'Viettel'].map(org => (
              <label key={org} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                <input type="checkbox" checked={autoApprove.includes(org)} onChange={(e) => {
                  if (e.target.checked) setAutoApprove([...autoApprove, org]);
                  else setAutoApprove(autoApprove.filter(o => o !== org));
                }} className="w-4 h-4 rounded" />
                <span className="text-sm">{org}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          {t('save')}
        </button>
      </div>
    </div>
  );
}

/* ========================= CLAIM DEGREE ========================= */
function StudentClaim({ t, step, setStep, otpValue, setOtpValue, showOtpMock, setShowOtpMock }: {
  t: (k: string) => string; step: string; setStep: (s: 'form' | 'otp' | 'success') => void;
  otpValue: string; setOtpValue: (v: string) => void; showOtpMock: boolean; setShowOtpMock: (v: boolean) => void;
}) {
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

          {/* Fallback */}
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


