import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IssuerDuplicateComparison } from './IssuerDuplicateComparison';
import type {DuplicateRecord } from './IssuerDuplicateComparison';
import { IssuerScanModal } from './IssuerScanModal';

const mockDuplicates: DuplicateRecord[] = [
  { studentId: 'STU001', existing: { fullName: 'Nguyen Van A', dob: '2000-01-01', major: 'IT', gradYear: '2022' }, incoming: { fullName: 'Nguyen Van A', dob: '2000-01-01', major: 'Computer Science', gradYear: '2022' } },
  { studentId: 'STU002', existing: { fullName: 'Tran Thi B', dob: '2001-02-15', major: 'Marketing', gradYear: '2023' }, incoming: { fullName: 'Tran Thi B', dob: '2001-05-12', major: 'Marketing', gradYear: '2023' } },
  { studentId: 'STU003', existing: { fullName: 'Le Van C', dob: '1999-11-20', major: 'Design', gradYear: '2021' }, incoming: { fullName: 'Le Van C', dob: '1999-11-20', major: 'Graphic Design', gradYear: '2021' } },
  { studentId: 'STU004', existing: { fullName: 'Pham Thi D', dob: '2002-08-08', major: 'Business', gradYear: '2024' }, incoming: { fullName: 'Pham Thi D', dob: '2002-08-08', major: 'Business Admin', gradYear: '2024' } },
  { studentId: 'STU005', existing: { fullName: 'Hoang Van E', dob: '2000-12-12', major: 'Engineering', gradYear: '2022' }, incoming: { fullName: 'Hoang Van E', dob: '2000-12-12', major: 'Mechanical Eng', gradYear: '2023' } },
];

export function IssuerUpload() {
  const { t, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [overwriteAll, setOverwriteAll] = useState(false);

  // States quản lý Modal
  const [isScanning, setIsScanning] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast('error', t('errNotCsv'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', t('errSizeLimit'));
      return;
    }
    
    // Pass validation -> Mở modal scan
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    setShowDuplicateModal(true); // Scan xong thì mở Duplicate Modal
  };

  const handleComparisonComplete = () => {
    setShowDuplicateModal(false);
    showToast('success', t('finalUploadCompleted')); // Báo thành công
  };
  return (
    <div>
      <p className="text-sm mb-8 text-muted-foreground">{t('uploadCSVDesc')}</p>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('uploadCSVDesc')}</p>

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
                // Reset value để có thể test chọn lại cùng 1 file
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          
          <Upload size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">{t('dragDropCSV')}</p>
          <p className="text-xs mt-2 opacity-50">{t('csvFormatLimit')}</p>
        </div>

        {/* Component Tách Riêng 1: Modal Scan Dữ Liệu */}
      <IssuerScanModal 
        isOpen={isScanning} 
        t={t} 
        onComplete={handleScanComplete} 
      />

      {/* Component Tách Riêng 2: Modal Xử Lý Trùng Lặp */}
      <IssuerDuplicateComparison 
        isOpen={showDuplicateModal}
        t={t}
        duplicates={mockDuplicates}
        onComplete={handleComparisonComplete}
      />
      </div>
    </div>
  );
}