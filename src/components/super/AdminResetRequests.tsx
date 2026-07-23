import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface RequestData {
  id: string;
  adminId: string;
  timestamp: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_REQUESTS: RequestData[] = [
  { id: 'req_001', adminId: 'AD_7738', timestamp: '2026-07-23T08:30:00Z', type: 'System Configuration Update', status: 'pending' },
  { id: 'req_002', adminId: 'AD_1102', timestamp: '2026-07-22T14:15:00Z', type: 'Access Level Escalation', status: 'pending' },
  { id: 'req_003', adminId: 'AD_9921', timestamp: '2026-07-21T09:45:00Z', type: 'Data Export Request', status: 'pending' },
];

export function AdminResetRequestTab({ t }: { t?: (key: string) => string }) {
  const [requests, setRequests] = useState<RequestData[]>(MOCK_REQUESTS);

  // Fallback cho hàm t() nếu bạn chưa truyền vào
  const translate = (key: string) => (t ? t(key) : key);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action } : req
    ));
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl text-[var(--ct-text)]">
          {translate('adminResetRequests')}
        </h1>
      </div>

      <div className="rounded-xl border overflow-hidden border-[var(--ct-border)]">
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
            <tr>
              <th className="px-4 py-3 font-semibold">{translate('adminId') || 'Admin ID'}</th>
              <th className="px-4 py-3 font-semibold">{translate('requestTime') || 'Time'}</th>
              <th className="px-4 py-3 font-semibold">{translate('requestType') || 'Request Type'}</th>
              <th className="px-4 py-3 font-semibold text-center">{translate('actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 border-[var(--ct-border)] text-[var(--ct-text)] transition-colors">
                <td className="px-4 py-3 font-medium">{req.adminId}</td>
                <td className="px-4 py-3 font-mono text-xs opacity-70">
                  {new Date(req.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">{req.type}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(req.id, 'approved')}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-all"
                          title={translate('approve') || 'Approve'}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                          title={translate('reject') || 'Reject'}
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        req.status === 'approved' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-6 text-center text-sm opacity-50 text-[var(--ct-text)]">
            {translate('noRequestsFound') || 'No pending requests.'}
          </p>
        )}
      </div>
    </div>
  );
}