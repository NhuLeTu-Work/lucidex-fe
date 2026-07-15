import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function StatCard({ label, value, icon, onClick }: StatCardProps) {
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