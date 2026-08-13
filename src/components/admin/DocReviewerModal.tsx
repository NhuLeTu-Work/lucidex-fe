import { useState } from 'react';
import { X, FileText, AlertTriangle, ExternalLink } from 'lucide-react';

export function DocViewerModal({ document, onClose, t }: any) {
  const [isCorrupted, setIsCorrupted] = useState(false);

  const docUrl = document?.url;
  const docName = document?.name || 'business_registration.pdf';
  const isImage = docUrl && (/\.(png|jpe?g|webp|gif|svg)$/i.test(docUrl) || document?.type?.startsWith('image/'));

  return (
    <div className="fixed inset-0 z-[70] flex flex-col p-4 md:p-10 animate-in fade-in" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="flex justify-between items-center mb-4">
        {/* Lấy tên file động từ dữ liệu Backend */}
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FileText size={18} />
          {docName}
        </h3>
        <button onClick={onClose} className="p-2 text-white opacity-70 hover:opacity-100 bg-white/10 rounded-full">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 rounded-xl bg-neutral-900 flex items-center justify-center relative overflow-hidden border border-neutral-700">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsCorrupted(!isCorrupted)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
              isCorrupted 
                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
            }`}
          >
            {isCorrupted ? 'Corrupted File Simulated' : (t('docLoadErr') || 'Simulate Corrupted File')}
          </button>
          {docUrl && !isCorrupted && (
            <a
              href={docUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Open Original
            </a>
          )}
        </div>

        {isCorrupted ? (
          <div className="text-center text-red-400 p-6 flex flex-col items-center gap-3">
            <AlertTriangle size={56} className="animate-bounce" />
            <p className="text-base font-semibold">{t('docLoadErr') || 'Unable to load document. File might be corrupted or inaccessible.'}</p>
            <p className="text-xs opacity-60 text-neutral-400">Please request the registrant to re-upload the document.</p>
          </div>
        ) : docUrl ? (
          isImage ? (
            <img src={docUrl} alt={docName} className="max-h-full max-w-full object-contain p-4 rounded-lg" />
          ) : (
            <iframe src={docUrl} title={docName} className="w-full h-full border-none rounded-xl" />
          )
        ) : (
          <div className="text-center opacity-70 text-white flex flex-col items-center">
            <FileText size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">Document Preview</p>
            <p className="text-xs text-neutral-400 max-w-md">
              Displaying simulated preview for <span className="text-white font-mono">{docName}</span>. No direct URL was returned by backend API.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}