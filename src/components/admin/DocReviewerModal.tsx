import { X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function DocViewerModal({ onClose, t }: any) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col p-4 md:p-10 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">business_registration.pdf</h3>
        <button onClick={onClose} className="p-2 text-white opacity-70 hover:opacity-100 bg-white/10 rounded-full"><X size={20} /></button>
      </div>
      <div className="flex-1 rounded-xl bg-neutral-800 flex items-center justify-center relative overflow-hidden border border-neutral-700">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={() => toast.error('Error', { description: t('docLoadErr') || 'This document could not be loaded.' })} className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/40">
            Simulate Corrupted File
          </button>
        </div>
        <div className="text-center opacity-40 text-white">
          <FileText size={64} className="mx-auto mb-4" />
          <p>PDF Viewer Simulator</p>
        </div>
      </div>
    </div>
  );
}