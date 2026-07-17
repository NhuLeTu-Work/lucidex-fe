import React from 'react';

interface StepRowProps {
  num: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  align: 'left' | 'right';
}

export function StepRow({ num, icon, title, desc, align }: StepRowProps) {
  return (
    <div className={`flex items-center gap-8 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
        <span style={{ color: 'var(--ct-text)' }}>{icon}</span>
      </div>
      <div className="flex-1">
        <span className="text-xs font-mono font-semibold mb-1 block" style={{ color: 'var(--ct-text-secondary)' }}>{num}</span>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{desc}</p>
      </div>
    </div>
  );
}