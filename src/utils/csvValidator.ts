export const REQUIRED_COLUMNS = [
  'StudentID',
  'Fullname',
  'DOB',
  'Vi-Major',
  'En-Major',
  'GraduationYear',
  'Vi-GraduationClassification',
  'En-GraduationClassification',
  'Vi-ModeOfStudy',
  'En-ModeOfStudy',
  'UniversityEmail',
  'NationalID',
  'ClassID',
] as const;

export interface CsvValidationError {
  row: number;
  type: 'format' | 'duplicate';
  detailKey: string;
  detailParams?: Record<string, string | number>;
  detailMessage?: string;
}

export interface ParseCsvResult {
  headersValid: boolean;
  hasNoData: boolean;
  missingColumns: string[];
  errors: CsvValidationError[];
  rows: Record<string, string>[];
}

// Regex validation rules
const STUDENT_ID_REGEX = /^B\d{7}$/;
const NO_NUMBERS_OR_SPECIAL_REGEX = /^[\p{L}\s]+$/u;
const NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX = /^[\p{L}\s-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NATIONAL_ID_REGEX = /^\d{12}$/;
const CLASS_ID_REGEX = /^[a-zA-Z0-9]{8}$/;

/**
 * Kiểm tra định dạng ngày dd/mm/yyyy hợp lệ
 */
function isValidDateDDMMYYYY(dateStr: string): boolean {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Parse đơn giản một chuỗi CSV (hỗ trợ escape quote cơ bản)
 */
export function parseCsvText(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

/**
 * Lọc bỏ các dòng bị lỗi và tạo lại một File CSV sạch chứa các dòng hợp lệ
 */
export function filterValidCsvFile(csvText: string, invalidRowNumbers: number[], fileName: string): File {
  const invalidSet = new Set(invalidRowNumbers);
  const parsed = parseCsvText(csvText);
  if (parsed.length === 0) return new File([], fileName, { type: 'text/csv' });

  // Giữ lại Header (index 0) và các dòng không nằm trong danh sách lỗi
  const validParsed = parsed.filter((_, idx) => idx === 0 || !invalidSet.has(idx));

  const csvLines = validParsed.map((row) =>
    row
      .map((cell) => {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',')
  );

  const cleanedCsvText = csvLines.join('\n');
  return new File([cleanedCsvText], fileName, { type: 'text/csv' });
}


/**
 * Validate header & từng dòng dữ liệu trong CSV
 */
export function validateCsvContent(csvText: string): ParseCsvResult {
  const parsed = parseCsvText(csvText);
  if (parsed.length === 0) {
    return {
      headersValid: false,
      hasNoData: true,
      missingColumns: [...REQUIRED_COLUMNS],
      errors: [],
      rows: [],
    };
  }

  const rawHeaders = parsed[0].map((h) => h.trim());
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !rawHeaders.includes(col)
  );

  if (missingColumns.length > 0) {
    return {
      headersValid: false,
      hasNoData: parsed.length <= 1,
      missingColumns,
      errors: [],
      rows: [],
    };
  }

  // File chỉ có header, không có dòng dữ liệu nào
  if (parsed.length <= 1) {
    return {
      headersValid: true,
      hasNoData: true,
      missingColumns: [],
      errors: [],
      rows: [],
    };
  }

  const errors: CsvValidationError[] = [];
  const rows: Record<string, string>[] = [];
  const keyMap = new Map<string, number>(); // [StudentID; ClassID] -> row_number

  for (let i = 1; i < parsed.length; i++) {
    const rowValues = parsed[i];
    const rowNumber = i; // Dòng 1 là header, data bắt đầu từ dòng 1 (row_number = i)

    const rowData: Record<string, string> = {};
    rawHeaders.forEach((header, idx) => {
      rowData[header] = rowValues[idx] || '';
    });
    rows.push(rowData);

    const studentId = rowData['StudentID'] || '';
    const fullname = rowData['Fullname'] || '';
    const dob = rowData['DOB'] || '';
    const viMajor = rowData['Vi-Major'] || '';
    const enMajor = rowData['En-Major'] || '';
    const gradYearStr = rowData['GraduationYear'] || '';
    const viGradClass = rowData['Vi-GraduationClassification'] || '';
    const enGradClass = rowData['En-GraduationClassification'] || '';
    const viMode = rowData['Vi-ModeOfStudy'] || '';
    const enMode = rowData['En-ModeOfStudy'] || '';
    const email = rowData['UniversityEmail'] || '';
    const nationalId = rowData['NationalID'] || '';
    const classId = rowData['ClassID'] || '';

    // 1. StudentID: B + 7 digits
    if (!STUDENT_ID_REGEX.test(studentId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidStudentId',
        detailParams: { val: studentId },
      });
    }

    // 2. Fullname: 2-200, no numbers/special
    if (fullname.length < 2 || fullname.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(fullname)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidFullname',
      });
    }

    // 3. DOB: dd/mm/yyyy
    if (!isValidDateDDMMYYYY(dob)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errFormatDobDetail',
        detailParams: { val: dob },
      });
    }

    // 4. Vi-Major: 2-200, no numbers/special
    if (viMajor.length < 2 || viMajor.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(viMajor)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidViMajor',
      });
    }

    // 5. En-Major: 2-200, no numbers/special
    if (enMajor.length < 2 || enMajor.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(enMajor)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidEnMajor',
      });
    }

    // 6. GraduationYear: >= 1970
    const gradYear = parseInt(gradYearStr, 10);
    if (isNaN(gradYear) || gradYear < 1970) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidGradYear',
        detailParams: { val: gradYearStr },
      });
    }

    // 7. Vi-GraduationClassification: 2-200, no numbers/special
    if (viGradClass.length < 2 || viGradClass.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(viGradClass)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidViGradClass',
      });
    }

    // 8. En-GraduationClassification: 2-200, no numbers/special
    if (enGradClass.length < 2 || enGradClass.length > 200 || !NO_NUMBERS_OR_SPECIAL_REGEX.test(enGradClass)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidEnGradClass',
      });
    }

    // 9. Vi-ModeOfStudy: 2-200, no numbers/special (cho phép "-")
    if (viMode.length < 2 || viMode.length > 200 || !NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX.test(viMode)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidViMode',
      });
    }

    // 10. En-ModeOfStudy: 2-200, no numbers/special (cho phép "-")
    if (enMode.length < 2 || enMode.length > 200 || !NO_NUMBERS_OR_SPECIAL_ALLOW_HYPHEN_REGEX.test(enMode)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidEnMode',
      });
    }

    // 11. UniversityEmail: valid email
    if (!EMAIL_REGEX.test(email)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidEmail',
        detailParams: { val: email },
      });
    }

    // 12. NationalID: 12 digits
    if (!NATIONAL_ID_REGEX.test(nationalId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidNationalIdDetail',
        detailParams: { val: nationalId },
      });
    }

    // 13. ClassID: 8 characters letters + digits
    if (!CLASS_ID_REGEX.test(classId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidClassId',
        detailParams: { val: classId },
      });
    }

    // Duplicate check [StudentID; ClassID] nội bộ file
    const uniqueKey = `${studentId.trim().toUpperCase()}_${classId.trim().toUpperCase()}`;
    if (keyMap.has(uniqueKey)) {
      const prevRow = keyMap.get(uniqueKey)!;
      errors.push({
        row: rowNumber,
        type: 'duplicate',
        detailKey: 'errInternalDuplicate',
        detailParams: { studentId, classId, prevRow },
      });
    } else {
      keyMap.set(uniqueKey, rowNumber);
    }
  }

  return {
    headersValid: true,
    hasNoData: false,
    missingColumns: [],
    errors,
    rows,
  };
}
