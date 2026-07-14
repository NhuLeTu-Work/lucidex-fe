import { useState } from 'react';
import {
  LayoutDashboard, Upload, ClipboardCheck, BarChart3,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, Users, Clock,
  ChevronRight, Download, FileText, Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { mockReviewQueue, currentIssuer, monthlyVerifications, topEmployers, topMajors, mockStudents } from '../data/mockData';
import type { AppContextType } from '../App';
import type { ReviewItem } from '../data/mockData';

type IssuerTab = 'dashboard' | 'upload' | 'review' | 'analytics';

export function IssuerPortal({ ctx }: { ctx: AppContextType }) {
  const { t } = ctx;
  const [activeTab, setActiveTab] = useState<IssuerTab>('dashboard');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(mockReviewQueue);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleApprove = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
  };

  const handleReject = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
  };

  const handleUpload = () => {
    setUploadState('uploading');
    setTimeout(() => setUploadState('success'), 2000);
  };

  const sidebarItems = [
    { id: 'dashboard' as IssuerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'upload' as IssuerTab, label: t('uploadCSV'), icon: <Upload size={18} /> },
    { id: 'review' as IssuerTab, label: t('manualReview'), icon: <ClipboardCheck size={18} /> },
    { id: 'analytics' as IssuerTab, label: t('analytics'), icon: <BarChart3 size={18} /> },
  ];

  const pendingCount = reviewItems.filter(r => r.status === 'pending').length;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
              <BuildingIcon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">{currentIssuer.name}</p>
              <p className="text-xs opacity-60">CICT - CTU</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60 hover:opacity-100'}`} style={{ background: activeTab === item.id ? '#000' : 'transparent' }}>
              {item.icon}
              {item.label}
              {item.id === 'review' && pendingCount > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
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

        {activeTab === 'dashboard' && <IssuerDashboard t={t} pendingCount={pendingCount} onTabChange={setActiveTab} />}
        {activeTab === 'upload' && <IssuerUpload t={t} uploadState={uploadState} onUpload={handleUpload} />}
        {activeTab === 'review' && <IssuerReview t={t} items={reviewItems} onApprove={handleApprove} onReject={handleReject} />}
        {activeTab === 'analytics' && <IssuerAnalytics t={t} />}
      </main>
    </div>
  );
}

/* ========================= DASHBOARD ========================= */
function IssuerDashboard({ t, pendingCount, onTabChange }: { t: (k: string) => string; pendingCount: number; onTabChange: (t: IssuerTab) => void }) {
  const activeStudents = mockStudents.filter(s => s.activated).length;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeIssuer')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('mockDataLabel')} — {t('phase1Label')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('verificationsThisMonth')} value="58" icon={<TrendingUp size={20} />} onClick={() => onTabChange('analytics')} />
        <StatCard label={t('activeStudents')} value={activeStudents.toString()} icon={<Users size={20} />} onClick={() => {}} />
        <StatCard label={t('pendingReviews')} value={pendingCount.toString()} icon={<Clock size={20} />} onClick={() => onTabChange('review')} />
        <StatCard label={t('uploadCSV')} value="+" icon={<Upload size={20} />} onClick={() => onTabChange('upload')} />
      </div>

      {/* Mini Chart */}
      <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verifyTrends')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyVerifications}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
            <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="count" stroke="#000" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('reviewQueue')}</h3>
          <button onClick={() => onTabChange('review')} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            {t('view')} <ChevronRight size={12} />
          </button>
        </div>
        {pendingCount === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noReviewItems')}</p>
        ) : (
          <div className="space-y-2">
            {mockReviewQueue.filter(r => r.status === 'pending').slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--ct-border)' }}>
                <div>
                  <p className="text-sm font-medium">{item.studentName}</p>
                  <p className="text-xs font-mono opacity-60">{item.studentId} — {t('confidenceScore')}: {(item.confidenceScore * 100).toFixed(0)}%</p>
                </div>
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
            ))}
          </div>
        )}
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

/* ========================= UPLOAD CSV ========================= */
function IssuerUpload({ t, uploadState, onUpload }: { t: (k: string) => string; uploadState: string; onUpload: () => void }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('uploadCSV')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('uploadCSVDesc')}</p>

      <div className="max-w-xl">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border mb-6 transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
          <Download size={16} />
          {t('downloadTemplate')}
        </button>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); onUpload(); }}
          onClick={uploadState === 'idle' ? onUpload : undefined}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-black bg-gray-50' : ''}`}
          style={{ borderColor: isDragging ? '#000' : 'var(--ct-border)', background: isDragging ? 'var(--ct-accent-blue)' : 'var(--ct-surface)' }}
        >
          {uploadState === 'idle' && (
            <>
              <Upload size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">{t('dragDropCSV')}</p>
              <p className="text-xs mt-2 opacity-50">CSV UTF-8 format</p>
            </>
          )}
          {uploadState === 'uploading' && (
            <div className="py-4">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">{t('processing')}</p>
            </div>
          )}
          {uploadState === 'success' && (
            <div className="py-4">
              <CheckCircle size={32} className="mx-auto mb-3 text-green-600" />
              <p className="text-sm font-semibold text-green-700">{t('uploadSuccess')}</p>
              <p className="text-xs mt-1 opacity-60">245 {t('recordsProcessed')}</p>
              <button onClick={(e) => { e.stopPropagation(); }} className="mt-3 text-xs underline opacity-60 hover:opacity-100">{t('view')}</button>
            </div>
          )}
        </div>

        {uploadState === 'success' && (
          <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-accent-green)' }}>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <FileText size={16} />
              <span>graduation_data_2024.csv — 245 records</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================= REVIEW QUEUE ========================= */
function IssuerReview({ t, items, onApprove, onReject }: { t: (k: string) => string; items: ReviewItem[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const pending = items.filter(i => i.status === 'pending');
  const processed = items.filter(i => i.status !== 'pending');

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('reviewQueue')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('reviewDesc')}</p>

      {/* Pending */}
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Clock size={16} />
        {t('pending')} ({pending.length})
      </h3>
      {pending.length === 0 ? (
        <p className="text-sm mb-8 p-4 rounded-xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)', color: 'var(--ct-text-secondary)' }}>{t('noReviewItems')}</p>
      ) : (
        <div className="space-y-3 mb-10">
          {pending.map(item => (
            <div key={item.id} className="p-5 rounded-xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{item.studentName}</p>
                  <p className="text-xs font-mono opacity-60">{item.studentId}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      {item.method === 'cccd_ocr' ? <Eye size={12} /> : <CheckCircle size={12} />}
                      {item.method === 'cccd_ocr' ? 'CCCD OCR' : 'Email OTP'}
                    </span>
                    <span className={`font-semibold ${item.confidenceScore < 0.8 ? 'text-amber-600' : 'text-green-600'}`}>
                      {t('confidenceScore')}: {(item.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onApprove(item.id)} className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white rounded-lg bg-black hover:opacity-80 transition-opacity">
                    <CheckCircle size={12} /> {t('approve')}
                  </button>
                  <button onClick={() => onReject(item.id)} className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                    <XCircle size={12} /> {t('reject')}
                  </button>
                </div>
              </div>
              {/* Confidence bar */}
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--ct-border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${item.confidenceScore * 100}%`, background: item.confidenceScore < 0.8 ? '#f59e0b' : '#22c55e' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <>
          <h3 className="font-semibold mb-3 opacity-60">{t('actions')} ({processed.length})</h3>
          <div className="space-y-2">
            {processed.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border opacity-60" style={{ borderColor: 'var(--ct-border)' }}>
                <div className="flex items-center gap-3">
                  {item.status === 'approved' ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-red-600" />}
                  <span className="text-sm">{item.studentName} — {item.studentId}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status === 'approved' ? t('approved') : t('rejected')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========================= ANALYTICS ========================= */
function IssuerAnalytics({ t }: { t: (k: string) => string }) {
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('analytics')}</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('verifyTrends')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyVerifications}>
              <defs>
                <linearGradient id="colorCount2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="#000" fill="url(#colorCount2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('topEmployers')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topEmployers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis type="number" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--ct-text-secondary)" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('topMajors')}</h3>
        <div className="grid sm:grid-cols-5 gap-4">
          {topMajors.map((major, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl border" style={{ borderColor: 'var(--ct-border)' }}>
              <p className="font-display text-2xl">{major.count}</p>
              <p className="text-xs mt-1 opacity-60">{major.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuildingIcon({ size }: { size: number }) {
  return <BarChart3 size={size} />;
}
