import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  roleLabel: string;
}

export function FeatureCard({ icon, title, desc, roleLabel }: FeatureCardProps) {
  return (
    <div className="p-8 rounded-2xl border transition-all hover:scale-[1.02]" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="mb-4" style={{ color: 'var(--ct-text)' }}>{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ct-text-secondary)' }}>{desc}</p>
      <div className="flex items-center gap-2 pt-4 border-t mt-auto" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
        <ArrowRight size={16} className="opacity-50" />
        <span className="text-sm font-medium opacity-80">{roleLabel}</span>
      </div>
    </div>
  );
}