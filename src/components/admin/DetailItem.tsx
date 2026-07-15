export function DetailItem({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-3 rounded-lg bg-black/5 dark:bg-white/5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--ct-text)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--ct-text)' }}>{value || '-'}</span>
    </div>
  );
}