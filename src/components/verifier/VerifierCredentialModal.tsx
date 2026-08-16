import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { mapOwnerCredentialToCertificateData } from '../certificates/ctuGraduation/certificateData';
import GraduationCertificate from '../certificates/ctuGraduation/GraduationCertificate';
import { CredentialCoverReveal } from '../certificates/CredentialCoverReveal';

interface VerifierCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCredentialData: any;
}

export function VerifierCredentialModal({ isOpen, onClose, rawCredentialData }: VerifierCredentialModalProps) {
  const [activeLang, setActiveLang] = useState<'vi' | 'en'>('vi');

  if (!isOpen || !rawCredentialData) return null;

  const data = mapOwnerCredentialToCertificateData(rawCredentialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#2A3439] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Chi tiết Văn bằng</h3>
              <p className="text-xs text-white/60">{data.vi.fullName} - MSSV: {rawCredentialData.student_id || rawCredentialData.studentId || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
          <div className="relative w-full max-w-md aspect-[820/1200] max-h-[60vh] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center my-auto">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <GraduationCertificate
                data={data}
                activeLang={activeLang}
                isMobileMode={true}
              />
            </div>

            {/* Layer Cover Reveal */}
            <CredentialCoverReveal
              logoUrl={data.logoUrl || '/ctuGraduation/ctuLogo.png'}
              title="BẰNG TỐT NGHIỆP"
              subtitle="CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
            />
          </div>
        </div>

        {/* Footer / Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveLang('en')}
              disabled={activeLang === 'en'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-medium transition-all ${
                activeLang === 'en' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 active:scale-95'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Tiếng Anh</span>
            </button>

            <span className="text-xs text-white/60 font-mono px-1">
              {activeLang === 'en' ? '1 / 2' : '2 / 2'}
            </span>

            <button
              onClick={() => setActiveLang('vi')}
              disabled={activeLang === 'vi'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-medium transition-all ${
                activeLang === 'vi' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 active:scale-95'
              }`}
            >
              <span>Tiếng Việt</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
