import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IssuerDuplicateComparison } from './IssuerDuplicateComparison';
import type { DuplicateRecord } from './IssuerDuplicateComparison';
import { IssuerScanModal } from './IssuerScanModal';
import { IssuerFileErrorModal } from './IssuerFileErrorModal';
import type { CsvErrorRecord } from './IssuerFileErrorModal';

// Mock data cho trường hợp trùng lặp DB
const mockDuplicates: DuplicateRecord[] = [
  { studentId: 'STU001', existing: { fullName: 'Nguyen Van A', dob: '2000-01-01', major: 'IT', gradYear: '2022' }, incoming: { fullName: 'Nguyen Van A', dob: '2000-01-01', major: 'Computer Science', gradYear: '2022' } },
  { studentId: 'STU002', existing: { fullName: 'Tran Thi B', dob: '2001-02-15', major: 'Marketing', gradYear: '2023' }, incoming: { fullName: 'Tran Thi B', dob: '2001-05-12', major: 'Marketing', gradYear: '2023' } },
];

// Mock data cho lỗi nội bộ file CSV
const mockCsvErrors: CsvErrorRecord[] = [
  { row: 12, type: 'format', detailKey: 'errFormatDob' },
  { row: 15, type: 'duplicate', detailKey: 'errInternalDuplicate' },
  { row: 16, type: 'duplicate', detailKey: 'errInternalDuplicate' },
];

export function IssuerUpload() {
  const { t, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [overwriteAll, setOverwriteAll] = useState(false);

  // States quản lý Modal theo luồng: Scan -> CsvError -> DuplicateDB
  const [isScanning, setIsScanning] = useState(false);
  const [showCsvErrorModal, setShowCsvErrorModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast('error', t('errNotCsv'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', t('errSizeLimit'));
      return;
    }
    
    // Bắt đầu scan
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    
    // Nếu có lỗi trong file CSV thì mở modal cảnh báo lỗi trước
    if (mockCsvErrors.length > 0) {
      setShowCsvErrorModal(true);
    } else {
      // Nếu file CSV sạch 100%, đi thẳng tới kiểm tra trùng lặp với DB
      setShowDuplicateModal(true);
    }
  };

  const handleContinueWithErrors = () => {
    setShowCsvErrorModal(false);
    // Bỏ qua các dòng lỗi và tiếp tục kiểm tra trùng lặp DB với các dòng còn lại
    setShowDuplicateModal(true);
  };

  const handleCancelUpload = () => {
    setShowCsvErrorModal(false);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    showToast('warning', t('uploadCancelled'));
  };

  const handleComparisonComplete = () => {
    setShowDuplicateModal(false);
    showToast('success', t('finalUploadCompleted')); 
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('uploadCSV')}</h1>
      <p className="text-sm mb-8 text-muted-foreground">{t('uploadCSVDesc')}</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 max-w-2xl gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          {t('downloadTemplate')}
        </Button>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="overwrite-all" 
            checked={overwriteAll}
            onCheckedChange={(checked) => setOverwriteAll(checked as boolean)}
          />
          <label htmlFor="overwrite-all" className="text-sm font-medium leading-none cursor-pointer">
            {t('overwriteAllDesc')}
          </label>
        </div>
      </div>

      <div className="max-w-2xl">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { 
            e.preventDefault(); 
            setIsDragging(false); 
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          
          <Upload size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">{t('dragDropCSV')}</p>
          <p className="text-xs mt-2 opacity-50">{t('csvFormatLimit')}</p>
        </div>
      </div>

      <IssuerScanModal 
        isOpen={isScanning} 
        t={t} 
        onComplete={handleScanComplete} 
      />

      {/* Modal Lỗi CSV (Format / Internal Duplicate) */}
      <IssuerFileErrorModal
        isOpen={showCsvErrorModal}
        t={t}
        errors={mockCsvErrors}
        onContinue={handleContinueWithErrors}
        onCancel={handleCancelUpload}
      />

      <IssuerDuplicateComparison 
        isOpen={showDuplicateModal}
        t={t}
        duplicates={mockDuplicates}
        onComplete={handleComparisonComplete}
      />
    </div>
  );
}