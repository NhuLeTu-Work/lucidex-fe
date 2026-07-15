import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  // Giữ lại prop badge của file 1 dưới dạng optional (?)
  badge?: string | number; 
  // Hỗ trợ cả 2 kiểu hiển thị chữ của các file cũ
  isLegacyStyle?: boolean; 
}

export function StatCard({ label, value, icon, badge, onClick, isLegacyStyle = false }: StatCardProps) {
  // File 1 dùng var(--ct-text), File 2 & 3 dùng var(--ct-text-secondary)
  const textColor = isLegacyStyle ? 'var(--ct-text)' : 'var(--ct-text-secondary)';

  return (
    <button 
      onClick={onClick} 
      className="p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] group relative" 
      style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
    >
      {/* Logic hiển thị badge của File 1 */}
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white">
          {badge}
        </span>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: textColor }} className={isLegacyStyle ? "opacity-60" : ""}>
          {icon}
        </span>
        <ChevronRight 
          size={14} 
          className="opacity-0 group-hover:opacity-50 transition-opacity" 
          style={{ color: textColor }} 
        />
      </div>
      
      <p className="font-display text-3xl" style={isLegacyStyle ? { color: 'var(--ct-text)' } : undefined}>
        {value}
      </p>
      
      <p 
        className={`text-xs mt-1 ${isLegacyStyle ? 'font-medium opacity-60 uppercase tracking-wider' : ''}`} 
        style={{ color: textColor }}
      >
        {label}
      </p>
    </button>
  );
}