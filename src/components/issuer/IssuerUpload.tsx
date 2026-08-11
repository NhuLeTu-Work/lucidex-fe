import { useState, useRef } from 'react';
import { Upload, Download, UserPlus } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IssuerDuplicateComparison } from './IssuerDuplicateComparison';
import type { DuplicateRecord } from './IssuerDuplicateComparison';
import { IssuerScanModal } from './IssuerScanModal';
import { IssuerFileErrorModal } from './IssuerFileErrorModal';
import type { CsvErrorRecord } from './IssuerFileErrorModal';
import { IssuerManualImportModal } from './IssuerManualImportModal';
import { parseExcelOrCsvFile, validateParsedRows, filterValidExcelOrCsvFile } from '@/utils/csvValidator';
import type { CsvCredentialRow } from '@/utils/csvValidator';
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
  const [showManualModal, setShowManualModal] = useState(false);

  const fixedValuesMap = useRef<Map<string, string>>(new Map());

  const handleFixError = (rowIndex: number, targetField: keyof CsvCredentialRow, newValue: string) => {
    fixedValuesMap.current.set(`${rowIndex}_${String(targetField)}`, newValue);
  };

  const handleFileSelect = async (file: File) => {
    fixedValuesMap.current.clear();
    const fname = file.name.toLowerCase();
    const isCsv = fname.endsWith('.csv') || file.type === 'text/csv';
    const isXlsx = fname.endsWith('.xlsx') || fname.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');

    // 1. Kiểm tra định dạng & dung lượng file gốc
    if (!isCsv && !isXlsx) {
      showToast('error', t('errNotCsv') || 'Định dạng file phải là .csv hoặc .xlsx');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', t('errSizeLimit') || 'Kích thước file vượt quá 10MB');
      return;
    }

    try {
      const parsedRows = await parseExcelOrCsvFile(file);
      const validationResult = validateParsedRows(parsedRows);

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
        fieldName: err.fieldName,
        targetField: err.targetField,
        oldValue: err.oldValue,
      }));
      setCsvErrors(mappedErrors);

      // Nếu header hợp lệ -> Tiến hành bật IssuerScanModal để đọc & validate dữ liệu
      setIsScanning(true);
    } catch (err: any) {
      showToast('error', t('errNoFileContent') || 'Không thể đọc nội dung file');
    }
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

  const sendImportCredentialsApi = async (fileToUse?: File, overwriteOverride?: boolean) => {
    const file = fileToUse || selectedFile;
    if (!file) return;

    const isOverwrite = overwriteOverride !== undefined ? overwriteOverride : overwriteAll;

    try {
      const response = await importCredentialsApi({
        file,
        overwrite_all: isOverwrite,
      });

      if (response.success) {
        const { created_count, updated_count, total_received } = response.data;
        const totalSuccessful = (created_count || 0) + (updated_count || 0);
        const successMsg = t('importSuccess')
          ? t('importSuccess')
              .replace('{X}', String(totalSuccessful))
              .replace('{Y}', String(total_received))
          : response.message || 'Import successful';

        showToast('success', successMsg);

        setSelectedFile(null);
        setCsvErrors([]);
        setDuplicateRecords([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        showToast('error', response.message || t('importFailed'));
      }
    } catch (err: any) {
      const apiErrMessage = err?.response?.data?.message || err?.message || t('errorImportCredentials');
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

    // Lọc bỏ TẤT CẢ các dòng lỗi (bất kể định dạng hay trùng lặp)
    const invalidRowNumbers = csvErrors.map((err) => err.row);
    const cleanedFile = await filterValidExcelOrCsvFile(selectedFile, invalidRowNumbers);

    setSelectedFile(cleanedFile);
    setCsvErrors([]);

    // Gửi API check duplicates tiếp tục với file đã được lọc sạch
    await sendCheckDuplicatesApi(cleanedFile);
  };

  const handleProcessSelectedRows = async (selectedRowIndexes: number[]) => {
    setShowCsvErrorModal(false);
    if (!selectedFile) return;

    const selectedSet = new Set(selectedRowIndexes);
    // Các dòng lỗi CẦN BỎ GIAO DIỆN (các dòng bị lỗi mà người dùng không tick chọn)
    const unselectedErrorRows = csvErrors
      .map((err) => err.row)
      .filter((rowNum) => !selectedSet.has(rowNum));

    // Thu thập các giá trị được auto-fix hoặc sửa thủ công cho các dòng được chọn
    const updatedRowValues: Record<number, Record<string, string>> = {};
    fixedValuesMap.current.forEach((val, key) => {
      const [rStr, fKey] = key.split('_');
      const rNum = parseInt(rStr, 10);
      if (selectedSet.has(rNum)) {
        if (!updatedRowValues[rNum]) updatedRowValues[rNum] = {};
        updatedRowValues[rNum][fKey] = val;
      }
    });

    const cleanedFile = await filterValidExcelOrCsvFile(
      selectedFile,
      unselectedErrorRows,
      updatedRowValues
    );

    setSelectedFile(cleanedFile);
    setCsvErrors([]);

    // Tiếp tục luồng gửi API check duplicates với file mới đã sửa/lọc
    await sendCheckDuplicatesApi(cleanedFile);
  };

  const handleCancelUpload = () => {
    setShowCsvErrorModal(false);
    setSelectedFile(null);
    setCsvErrors([]);
    setDuplicateRecords([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('warning', t('uploadCancelled') || 'Đã hủy tải file');
  };

  const handleComparisonComplete = async (action: 'overwrite' | 'skip') => {
    setShowDuplicateModal(false);
    const shouldOverwrite = action === 'overwrite';
    await sendImportCredentialsApi(undefined, shouldOverwrite);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templateFiles/ctu_student_data_file_template.xlsx';
    link.download = 'ctu_student_data_file_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('uploadCSV')}</h1>
      <p className="text-sm mb-8 text-muted-foreground">{t('uploadCSVDesc')}</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 max-w-2xl gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplate}>
            <Download size={16} />
            {t('downloadTemplate')}
          </Button>

          <Button className="flex items-center gap-2" onClick={() => setShowManualModal(true)}>
            <UserPlus size={16} />
            {t('addManualCredential')}
          </Button>
        </div>

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
            accept=".csv,.xlsx,.xls"
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
        onFixError={handleFixError}
        onProcessSelectedRows={handleProcessSelectedRows}
      />

      <IssuerDuplicateComparison
        isOpen={showDuplicateModal}
        t={t}
        duplicates={duplicateRecords}
        onComplete={handleComparisonComplete}
      />

      <IssuerManualImportModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />
    </div>
  );
}