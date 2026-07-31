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
import { validateCsvContent, filterValidCsvFile } from '@/utils/csvValidator';
import { checkDuplicatesApi } from '@/api/endpoints/issuer/checkDuplicatesApi';
import { importCredentialsApi } from '@/api/endpoints/issuer/importCredentialsApi';

export function IssuerUpload() {
  const { t, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [overwriteAll, setOverwriteAll] = useState(false);

  // States quản lý file & validation
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvErrors, setCsvErrors] = useState<CsvErrorRecord[]>([]);
  const [duplicateRecords, setDuplicateRecords] = useState<DuplicateRecord[]>([]);

  // States quản lý Modal theo luồng: Scan -> CsvError -> DuplicateDB
  const [isScanning, setIsScanning] = useState(false);
  const [showCsvErrorModal, setShowCsvErrorModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleFileSelect = (file: File) => {
    // 1. Kiểm tra định dạng & dung lượng file gốc
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      showToast('error', t('errNotCsv') || 'Định dạng file không phải CSV');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', t('errSizeLimit') || 'Kích thước file vượt quá 10MB');
      return;
    }

    // Đọc file để kiểm tra header trước
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) {
        showToast('error', t('errNoFileContent'));
        return;
      }

      const validationResult = validateCsvContent(csvText);

      // Kiểm tra thiếu column
      if (!validationResult.headersValid) {
        const missingStr = validationResult.missingColumns.join(', ');
        const headerErrMsg = t('errInvalidHeader')
          ? t('errInvalidHeader').replace('{missing}', missingStr)
          : `định dạng không hợp lệ, thiếu những trường: ${missingStr}`;
        showToast('error', headerErrMsg);
        return;
      }

      // Kiểm tra nếu file không có dữ liệu (chỉ có header hoặc file rỗng)
      if (validationResult.hasNoData) {
        showToast('error', t('errCsvNoData'));
        return;
      }

      // Lưu trữ file và danh sách lỗi row (nếu có)
      setSelectedFile(file);
      const mappedErrors: CsvErrorRecord[] = validationResult.errors.map((err) => ({
        row: err.row,
        type: err.type,
        detailKey: err.detailKey,
        detailParams: err.detailParams,
        detailMessage: err.detailMessage,
      }));
      setCsvErrors(mappedErrors);

      // Nếu header hợp lệ -> Tiến hành bật IssuerScanModal để đọc & validate dữ liệu
      setIsScanning(true);
    };

    reader.onerror = () => {
      showToast('error', t('errNoFileContent'));
    };

    reader.readAsText(file);
  };

  const handleScanComplete = async () => {
    setIsScanning(false);

    // Nếu có lỗi định dạng/trùng nội bộ dòng trong file CSV thì mở modal cảnh báo trước
    if (csvErrors.length > 0) {
      setShowCsvErrorModal(true);
      return;
    }

    // Nếu file CSV hợp lệ 100%, gửi API check duplicates
    await sendCheckDuplicatesApi();
  };

  const sendImportCredentialsApi = async (fileToUse?: File) => {
    const file = fileToUse || selectedFile;
    if (!file) return;

    try {
      const response = await importCredentialsApi({
        file,
        overwrite_all: overwriteAll,
      });

      if (response.success) {
        const { created_count, total_received } = response.data;
        const successMsg = t('successCreated')
          ? t('successCreated')
              .replace('{X}', String(created_count))
              .replace('{Y}', String(total_received))
          : response.message || `Import thành công`;

        showToast('success', successMsg);

        setSelectedFile(null);
        setCsvErrors([]);
        setDuplicateRecords([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        showToast('error', response.message || 'Import thất bại');
      }
    } catch (err: any) {
      const apiErrMessage = err?.response?.data?.message || err?.message || 'Lỗi khi import credentials';
      showToast('error', apiErrMessage);
    }
  };

  const sendCheckDuplicatesApi = async (fileToUse?: File) => {
    const file = fileToUse || selectedFile;
    if (!file) return;

    try {
      const response = await checkDuplicatesApi(file);

      // 1. Kiểm tra nếu file trùng hoàn toàn qua checksum (FILE_ALREADY_IMPORTED)
      if (response.error_code === 'FILE_ALREADY_IMPORTED') {
        showToast(
          'error',
          response.message || t('errorRegValidation')
        );
        return;
      }

      // 2. Kiểm tra trùng vượt ngưỡng (DUPLICATE_THRESHOLD_EXCEEDED >= 90%)
      if (response.error_code === 'DUPLICATE_THRESHOLD_EXCEEDED') {
        const ratioPercent = Math.round((response.data?.duplicate_ratio || 0.9) * 100);
        const thresholdMsg = t('duplicateThresholdSummary')
          ? t('duplicateThresholdSummary')
              .replace('{count}', String(response.data?.duplicate_count || 0))
              .replace('{total}', String(response.data?.total_rows || 0))
              .replace('{percent}', String(ratioPercent))
          : response.message;
        showToast('warning', thresholdMsg);
        return;
      }

      // 3. Nếu API có trả danh sách trùng lặp chi tiết
      if (response.data?.has_duplicates && response.data.duplicates.length > 0) {
        const mappedDuplicates: DuplicateRecord[] = response.data.duplicates.map((item) => ({
          studentId: item.student_id,
          classCode: item.class_code,
          rowNumber: item.row_number,
          existing: item.existing,
          incoming: item.incoming,
        }));
        setDuplicateRecords(mappedDuplicates);
        setShowDuplicateModal(true);
        return;
      }

      // 4. Nếu không có duplicate -> Gọi API Import
      await sendImportCredentialsApi(file);
    } catch (err: any) {
      const apiErrMessage = err?.response?.data?.message || err?.message || t('errCheckDuplicatesFailed');
      showToast('error', apiErrMessage);
    }
  };

  const handleContinueWithErrors = async () => {
    setShowCsvErrorModal(false);

    if (!selectedFile) return;

    // Đọc và lọc bỏ các dòng lỗi trong file CSV hiện tại
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) return;

      const invalidRowNumbers = csvErrors.map((err) => err.row);
      const cleanedFile = filterValidCsvFile(csvText, invalidRowNumbers, selectedFile.name);

      setSelectedFile(cleanedFile);
      setCsvErrors([]);

      // Tiếp tục gửi API check duplicates với file CSV đã lọc sạch dòng lỗi
      await sendCheckDuplicatesApi(cleanedFile);
    };

    reader.readAsText(selectedFile);
  };

  const handleCancelUpload = () => {
    setShowCsvErrorModal(false);
    setSelectedFile(null);
    setCsvErrors([]);
    setDuplicateRecords([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('warning', t('uploadCancelled') || 'Đã hủy tải file');
  };

  const handleComparisonComplete = async () => {
    setShowDuplicateModal(false);
    await sendImportCredentialsApi();
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templateFiles/ctu_student_data_file_template.csv';
    link.download = 'ctu_student_data_file_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('uploadCSV')}</h1>
      <p className="text-sm mb-8 text-muted-foreground">{t('uploadCSVDesc')}</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 max-w-2xl gap-4">
        <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplate}>
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
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'
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
        errors={csvErrors}
        onContinue={handleContinueWithErrors}
        onCancel={handleCancelUpload}
      />

      <IssuerDuplicateComparison
        isOpen={showDuplicateModal}
        t={t}
        duplicates={duplicateRecords}
        onComplete={handleComparisonComplete}
      />
    </div>
  );
}