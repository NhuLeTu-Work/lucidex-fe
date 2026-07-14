import { useState } from 'react';
import {
  LayoutDashboard, Building2, Users, ShieldCheck, FileText,
  CheckCircle, XCircle, Search, ChevronRight,
  TrendingUp, Inbox, FileSignature, X, AlertCircle, Mail
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { mockAccounts, currentAdmin, monthlyVerifications } from '../data/mockData';
import type { AppContextType } from '../App';

type AdminTab = 'dashboard' | 'requests' | 'accounts';
type RequestSubTab = 'issuer' | 'hr';

export function AdminPortal({ ctx }: { ctx: AppContextType }) {
  const { t } = ctx;
  
  // State quản lý danh sách tài khoản (thay vì call API)
  const [accounts, setAccounts] = useState<any[]>(mockAccounts);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('issuer');
  
  // Modals & Toast State
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [toast, setToast] = useState<{title: string, desc: string, type: 'success'|'error'} | null>(null);

  // Computed Data
  const pendingRequests = accounts.filter(a => a.status === 'pending' && a.registrationData);
  
  // Sắp xếp "oldest first" theo yêu cầu
  const pendingIssuers = pendingRequests
    .filter(a => a.type === 'issuer')
    .sort((a, b) => new Date(a.registrationData.submittedAt).getTime() - new Date(b.registrationData.submittedAt).getTime());
    
  const pendingOrgs = pendingRequests
    .filter(a => a.type === 'hr')
    .sort((a, b) => new Date(a.registrationData.submittedAt).getTime() - new Date(b.registrationData.submittedAt).getTime());

  const totalAccounts = accounts.length;

  const showToast = (title: string, desc: string, type: 'success'|'error') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 5000); // Ẩn sau 5s
  };

  // 4.3 - Luồng Approve
  const handleApprove = (req: any) => {
    setAccounts(prev => prev.map(a => a.id === req.id ? { ...a, status: 'setup_required' } : a));
    setSelectedReq(null);
    showToast(
      t('emailSent') || 'Email Sent',
      `Title: Your Lucidex Application Has Been Approved\nBody: Dear ${req.registrationData.regName}, we are pleased to inform you that your application for ${req.registrationData.orgName} has been approved...`,
      'success'
    );
  };

  // 4.3 - Luồng Reject
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setAccounts(prev => prev.map(a => a.id === selectedReq.id ? { 
      ...a, 
      status: 'rejected', 
      registrationData: { ...a.registrationData, rejectedReason: rejectReason } 
    } : a));
    
    const reqName = selectedReq.registrationData.regName;
    const orgName = selectedReq.registrationData.orgName;
    
    setRejectModalOpen(false);
    setSelectedReq(null);
    setRejectReason('');
    
    showToast(
      t('emailSent') || 'Email Sent',
      `Title: Update on Your Lucidex Application\nBody: Dear ${reqName}, thank you for your interest. After reviewing your application for ${orgName}, we are unable to approve it at this time. Reason: ${rejectReason}.`,
      'error'
    );
  };

  const sidebarItems = [
    { id: 'dashboard' as AdminTab, label: t('dashboard') || 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'requests' as AdminTab, label: t('pendingRequests') || 'Pending Requests', icon: <Inbox size={18} /> },
    { id: 'accounts' as AdminTab, label: t('accounts') || 'Accounts', icon: <Users size={18} /> },
  ];

  const accountTypeData = [
    { name: t('student') || 'Student', value: accounts.filter(a => a.type === 'student').length },
    { name: t('issuer') || 'Issuer', value: accounts.filter(a => a.type === 'issuer').length },
    { name: t('hr') || 'Verifier', value: accounts.filter(a => a.type === 'hr').length },
    { name: t('admin') || 'Admin', value: accounts.filter(a => a.type === 'admin').length },
  ];
  const COLORS = ['#000000', '#666666', '#999999', '#cccccc'];

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      {/* Toast Notification (Simulate Email) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm p-4 rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
          <div className="flex items-start gap-3">
            <Mail className="shrink-0 mt-0.5" size={20} style={{ color: toast.type === 'success' ? '#10b981' : '#ef4444' }} />
            <div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--ct-text)' }}>{toast.title}</h4>
              <p className="text-xs opacity-70 whitespace-pre-line" style={{ color: 'var(--ct-text)' }}>{toast.desc}</p>
            </div>
            <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100" style={{ color: 'var(--ct-text)' }}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ct-text)' }}>{currentAdmin.name}</p>
              <p className="text-xs opacity-60" style={{ color: 'var(--ct-text)' }}>System Administrator</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60 hover:opacity-100'}`} style={{ background: activeTab === item.id ? '#000' : 'transparent', color: activeTab === item.id ? '#fff' : 'var(--ct-text)' }}>
              {item.icon}
              {item.label}
              {item.id === 'requests' && pendingRequests.length > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{pendingRequests.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60'}`} style={{ background: activeTab === item.id ? '#000' : 'var(--ct-surface)', color: activeTab === item.id ? '#fff' : 'var(--ct-text)' }}>
              {item.icon}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <AdminDashboard t={t} pendingCount={pendingRequests.length} totalAccounts={totalAccounts} onTabChange={setActiveTab} accountTypeData={accountTypeData} COLORS={COLORS} />}
        
        {/* ======================= 4.1 VIEW PENDING REQUESTS ======================= */}
        {activeTab === 'requests' && (
          <div className="animate-in fade-in">
            <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--ct-text)' }}>{t('pendingRequests') || 'Pending Requests'}</h1>
            <p className="text-sm mb-6 opacity-70" style={{ color: 'var(--ct-text)' }}>{t('pendingRequestsDesc') || 'Process registration requests in a fair, predictable order.'}</p>

            {/* Tabs Issuer / Organization */}
            <div className="flex border-b mb-6" style={{ borderColor: 'var(--ct-border)' }}>
              <button 
                onClick={() => setReqSubTab('issuer')}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${reqSubTab === 'issuer' ? 'opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                style={{ borderColor: reqSubTab === 'issuer' ? 'var(--ct-text)' : 'transparent', color: 'var(--ct-text)' }}
              >
                {t('tabIssuer') || 'Issuer'} ({pendingIssuers.length})
              </button>
              <button 
                onClick={() => setReqSubTab('hr')}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${reqSubTab === 'hr' ? 'opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                style={{ borderColor: reqSubTab === 'hr' ? 'var(--ct-text)' : 'transparent', color: 'var(--ct-text)' }}
              >
                {t('tabOrg') || 'Organization'} ({pendingOrgs.length})
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {reqSubTab === 'issuer' ? (
                pendingIssuers.length === 0 ? (
                  <p className="text-sm opacity-60 italic" style={{ color: 'var(--ct-text)' }}>{t('noPendingReq') || 'No pending requests.'}</p>
                ) : (
                  pendingIssuers.map(req => (
                    <div key={req.id} onClick={() => setSelectedReq(req)} className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
                      <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--ct-text)' }}>{req.registrationData.orgName}</h3>
                        <p className="text-xs opacity-60 font-mono" style={{ color: 'var(--ct-text)' }}>{t('submittedAt') || 'Submitted'}: {new Date(req.registrationData.submittedAt).toLocaleString()}</p>
                      </div>
                      <ChevronRight size={16} className="opacity-40" style={{ color: 'var(--ct-text)' }} />
                    </div>
                  ))
                )
              ) : (
                pendingOrgs.length === 0 ? (
                  <p className="text-sm opacity-60 italic" style={{ color: 'var(--ct-text)' }}>{t('noPendingReq') || 'No pending requests.'}</p>
                ) : (
                  pendingOrgs.map(req => (
                    <div key={req.id} onClick={() => setSelectedReq(req)} className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
                      <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--ct-text)' }}>{req.registrationData.orgName}</h3>
                        <p className="text-xs opacity-60 font-mono" style={{ color: 'var(--ct-text)' }}>{t('submittedAt') || 'Submitted'}: {new Date(req.registrationData.submittedAt).toLocaleString()}</p>
                      </div>
                      <ChevronRight size={16} className="opacity-40" style={{ color: 'var(--ct-text)' }} />
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'accounts' && <AdminAccounts t={t} accounts={accounts} />}
      </main>

      {/* ======================= 4.2 & 4.3 REQUEST DETAIL MODAL ======================= */}
      {selectedReq && !rejectModalOpen && !docViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 flex flex-col gap-6" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
            
            <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--ct-border)' }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-2 inline-block">
                  {selectedReq.type === 'issuer' ? 'Issuer Application' : 'Verifier Application'}
                </span>
                <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--ct-text)' }}>{selectedReq.registrationData.orgName}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg opacity-50 hover:opacity-100" style={{ color: 'var(--ct-text)' }}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label={selectedReq.type === 'issuer' ? (t('lblInstName')||'Institution Name') : (t('lblOrgName')||'Company Name')} value={selectedReq.registrationData.orgName} />
              <DetailItem label={selectedReq.type === 'issuer' ? (t('lblTaxCode')||'Tax Code') : (t('lblMSDN')||'10-digit MSDN')} value={selectedReq.registrationData.taxCode} />
              <DetailItem label={t('lblAddress')||'Registered Address'} value={selectedReq.registrationData.address} fullWidth />
              <DetailItem label={t('lblLegalRep')||'Legal Representative'} value={selectedReq.registrationData.legalRep} />
              <DetailItem label={t('lblContactPhone')||'Contact Phone'} value={selectedReq.registrationData.contactPhone} />
              <DetailItem label={t('lblContactGmail')||'Contact Gmail'} value={selectedReq.email} />
              <DetailItem label={t('lblRegName')||'Registrant Name'} value={selectedReq.registrationData.regName} />
              {selectedReq.type === 'hr' && (
                <DetailItem label={t('lblRegTitle')||'Registrant Title'} value={selectedReq.registrationData.regTitle} />
              )}
            </div>

            {/* Attached Documents Section */}
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--ct-text)' }}>{t('attachedDocs') || 'Attached Documents'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setDocViewerOpen(true)} className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)' }}>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><FileSignature size={18} /></div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--ct-text)' }}>business_registration.pdf</p>
                    <p className="text-xs opacity-50" style={{ color: 'var(--ct-text)' }}>2.4 MB</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t mt-2" style={{ borderColor: 'var(--ct-border)' }}>
              <button onClick={() => handleApprove(selectedReq)} className="flex-1 py-3 text-sm font-semibold text-white rounded-xl bg-black shadow-md transition-all hover:opacity-80 active:scale-[0.99] flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {t('approve') || 'Approve'}
              </button>
              <button onClick={() => setRejectModalOpen(true)} className="flex-1 py-3 text-sm font-semibold text-red-600 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                <XCircle size={16} /> {t('reject') || 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ct-text)' }}>{t('rejectReasonTitle') || 'Reason for Rejection'}</h3>
            <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
              {t('rejectReasonDesc') || 'Please provide a reason for rejecting this application. This will be sent to the applicant.'}
            </p>
            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('enterReason') || 'e.g. The uploaded document is blurred...'}
                rows={4}
                required
                className="w-full p-3 text-sm rounded-xl border outline-none focus:border-red-400 resize-none"
                style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
                onInvalid={(e) => (e.target as HTMLTextAreaElement).setCustomValidity(t('reqReasonErr') || 'A reason is required.')}
                onInput={(e) => (e.target as HTMLTextAreaElement).setCustomValidity('')}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-xl transition-all opacity-70 hover:opacity-100" style={{ color: 'var(--ct-text)' }}>
                  {t('cancel') || 'Cancel'}
                </button>
                <button type="submit" disabled={!rejectReason.trim()} className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-red-600 shadow-md transition-all hover:opacity-90 disabled:opacity-50">
                  {t('confirmReject') || 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {docViewerOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col p-4 md:p-10 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">business_registration.pdf</h3>
            <button onClick={() => setDocViewerOpen(false)} className="p-2 text-white opacity-70 hover:opacity-100 bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          <div className="flex-1 rounded-xl bg-neutral-800 flex items-center justify-center relative overflow-hidden border border-neutral-700">
            {/* Nút giả lập tài liệu bị hỏng (để test AC) */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={() => showToast('Error', t('docLoadErr') || 'This document could not be loaded.', 'error')} className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/40">
                Simulate Corrupted File
              </button>
            </div>
            
            <div className="text-center opacity-40">
              <FileText size={64} className="mx-auto mb-4" />
              <p>PDF Viewer Simulator</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-components
function DetailItem({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-3 rounded-lg bg-black/5 dark:bg-white/5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--ct-text)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--ct-text)' }}>{value || '-'}</span>
    </div>
  );
}

function AdminDashboard({ t, pendingCount, totalAccounts, onTabChange, accountTypeData, COLORS }: any) {
  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--ct-text)' }}>{t('welcomeAdmin') || 'Welcome back, Admin'}</h1>
      <p className="text-sm mb-8 opacity-70" style={{ color: 'var(--ct-text)' }}>System Overview</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('pendingRequests') || 'Pending Requests'} value={pendingCount.toString()} icon={<Inbox size={20} />} badge={pendingCount > 0 ? pendingCount.toString() : undefined} onClick={() => onTabChange('requests')} />
        <StatCard label={t('accounts') || 'Total Accounts'} value={totalAccounts.toString()} icon={<Users size={20} />} onClick={() => onTabChange('accounts')} />
        <StatCard label={t('verificationsThisMonth') || 'Verifications'} value="58" icon={<TrendingUp size={20} />} onClick={() => {}} />
        <StatCard label="System Status" value="OK" icon={<ShieldCheck size={20} />} onClick={() => {}} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ct-text)' }}>{t('verifyTrends') || 'Verification Trends'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyVerifications}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="var(--ct-text)" fill="url(#adminGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ct-text)' }}>{t('accounts') || 'Accounts Distribution'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={accountTypeData} 
                cx="50%" cy="50%" 
                innerRadius={60} outerRadius={90} 
                paddingAngle={4} 
                dataKey="value"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (percent < 0.05) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {accountTypeData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              
              {/* Custom Tooltip hiển thị Tên + Số lượng + % */}
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const total = accountTypeData.reduce((sum: number, item: any) => sum + item.value, 0);
                    const percent = total > 0 ? ((data.value as number) / total * 100).toFixed(1) : 0;
                    return (
                      <div className="px-3 py-2 rounded-lg border shadow-sm text-sm" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                        <div className="font-semibold mb-0.5 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: data.payload.fill }}></div>
                          {data.name}
                        </div>
                        <div className="opacity-80 ml-4">
                          {data.value} <span className="text-xs">({percent}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Chú thích màu sắc (Legend) */}
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {accountTypeData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-xs opacity-70" style={{ color: 'var(--ct-text)' }}>
                  {entry.name}: <span className="font-semibold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAccounts({ t, accounts }: { t: (k: string) => string, accounts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = accounts.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-6" style={{ color: 'var(--ct-text)' }}>{t('accounts') || 'Accounts'}</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--ct-text)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search') || 'Search...'} className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
          <option value="all">{t('all') || 'All Types'}</option>
          <option value="student">{t('student') || 'Student'}</option>
          <option value="issuer">{t('issuer') || 'Issuer'}</option>
          <option value="hr">{t('hr') || 'Verifier'}</option>
          <option value="admin">{t('admin') || 'Admin'}</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--ct-border)' }}>
        <table className="w-full text-sm text-left">
          <thead>
            <tr style={{ background: 'var(--ct-surface)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id} className="border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                <td className="px-4 py-3 font-medium">{acc.name}</td>
                <td className="px-4 py-3 text-xs font-mono opacity-70">{acc.email}</td>
                <td className="px-4 py-3 uppercase text-[10px] tracking-wider font-bold">{acc.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${acc.status === 'active' || acc.status === 'setup_required' ? 'bg-green-100 text-green-700' : acc.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {acc.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, badge, onClick }: any) {
  return (
    <button onClick={onClick} className="p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] group relative" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      {badge && <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white">{badge}</span>}
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: 'var(--ct-text)' }} className="opacity-60">{icon}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--ct-text)' }} />
      </div>
      <p className="font-display text-3xl" style={{ color: 'var(--ct-text)' }}>{value}</p>
      <p className="text-xs mt-1 font-medium opacity-60 uppercase tracking-wider" style={{ color: 'var(--ct-text)' }}>{label}</p>
    </button>
  );
}