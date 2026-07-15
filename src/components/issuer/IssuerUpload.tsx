import { useState } from 'react';
import { Upload, Download, CheckCircle, FileText } from 'lucide-react';
import type { UploadState } from '../../types/issuer';

interface IssuerUploadProps {
  t: (k: string) => string;
  uploadState: UploadState;
  onUpload: () => void;
}

export function IssuerUpload({ t, uploadState, onUpload }: IssuerUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('uploadCSV')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('uploadCSVDesc')}</p>

      <div className="max-w-xl">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border mb-6 transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
          <Download size={16} />
          {t('downloadTemplate')}
        </button>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); onUpload(); }}
          onClick={uploadState === 'idle' ? onUpload : undefined}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-black bg-gray-50' : ''}`}
          style={{ borderColor: isDragging ? '#000' : 'var(--ct-border)', background: isDragging ? 'var(--ct-accent-blue)' : 'var(--ct-surface)' }}
        >
          {uploadState === 'idle' && (
            <>
              <Upload size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">{t('dragDropCSV')}</p>
              <p className="text-xs mt-2 opacity-50">CSV UTF-8 format</p>
            </>
          )}
          {uploadState === 'uploading' && (
            <div className="py-4">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">{t('processing')}</p>
            </div>
          )}
          {uploadState === 'success' && (
            <div className="py-4">
              <CheckCircle size={32} className="mx-auto mb-3 text-green-600" />
              <p className="text-sm font-semibold text-green-700">{t('uploadSuccess')}</p>
              <p className="text-xs mt-1 opacity-60">245 {t('recordsProcessed')}</p>
              <button onClick={(e) => { e.stopPropagation(); }} className="mt-3 text-xs underline opacity-60 hover:opacity-100">{t('view')}</button>
            </div>
          )}
        </div>

        {uploadState === 'success' && (
          <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-accent-green)' }}>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <FileText size={16} />
              <span>graduation_data_2024.csv — 245 records</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}