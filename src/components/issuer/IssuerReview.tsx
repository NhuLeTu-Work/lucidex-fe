import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { ReviewItem } from '../../data/mockData';

interface IssuerReviewProps {
  t: (k: string) => string;
  items: ReviewItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function IssuerReview({ t, items, onApprove, onReject }: IssuerReviewProps) {
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
                  <p className="font-semibold">{item.ownerName}</p>
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
                  <span className="text-sm">{item.ownerName} — {item.studentId}</span>
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