import React from 'react';

interface RoleCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function RoleCard({ icon, label, onClick }: RoleCardProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <span style={{ color: 'var(--ct-text)' }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: 'var(--ct-text-secondary)' }}>{label}</span>
    </button>
  );
}