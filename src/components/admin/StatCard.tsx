import { ChevronRight } from 'lucide-react';

export function StatCard({ label, value, icon, badge, onClick }: any) {
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