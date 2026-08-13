import {
  VIETNAM_PROVINCES,
  DEGREE_TYPES,
  MODE_OF_STUDY_OPTIONS,
  CLASSIFICATION_OPTIONS,
} from '@/utils/credentialConstants';

export interface CsvCredentialRow {
  stt?: string;
  student_id: string;
  last_name?: string;
  first_name?: string;
  full_name: string;
  dob: string;
  place_of_birth?: string;
  gender?: string;
  national_id?: string;
  degree_type?: string;
  class_id: string;
  faculty?: string;
  major?: string;
  specialization?: string;
  cpa?: string;
  classification?: string;
  degree_number?: string;
  register_number?: string;
  graduation_year?: string;
  mode_of_study?: string;
  university_email?: string;
}

export interface CsvValidationError {
  row: number;
  type: 'format' | 'duplicate';
  detailKey: string;
  detailParams?: Record<string, string | number>;
  detailMessage?: string;
  fieldName?: string;
  targetField?: keyof CsvCredentialRow;
  oldValue?: string;
}

export interface ParseCsvResult {
  headersValid: boolean;
  hasNoData: boolean;
  missingColumns: string[];
  errors: CsvValidationError[];
  rows: Record<string, string>[];
  mappedData?: CsvCredentialRow[];
}

/**
 * Clean multi-slash sequences: replace multiple backslashes or mix of \ and / into /
 * Also trim text fields and auto-convert single backslashes \ to /
 */
export function sanitizeTextField(text: string): string {
  if (!text) return '';
  let sanitized = text.replace(/\\+/g, '/');
  return sanitized.trim();
}

/**
 * Removes special characters and digits, preserving letters and spaces
 */
export function removeSpecialCharsAndDigits(text: string): string {
  if (!text) return '';
  return text.replace(/[^\p{L}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

/**
 * Capitalizes first letter of each word (Title Case) - e.g., 'cần thơ' -> 'Cần Thơ'
 */
export function capitalizeWords(text: string): string {
  const cleaned = removeSpecialCharsAndDigits(text);
  if (!cleaned) return '';
  return cleaned
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalizes only the first letter of the whole string - e.g., 'chính quy' -> 'Chính quy'
 */
export function capitalizeFirstLetter(text: string): string {
  const cleaned = removeSpecialCharsAndDigits(text);
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Normalizes header string by trimming and removing extra spaces between words
 */
export function normalizeHeaderString(h: string): string {
  return h.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Checks general text format for special characters (@, #, $, %, ^, &, !, etc.)
 * Accepts letters, digits, spaces, hyphens '-', and slashes '/'
 * Length: 2 to 300 characters
 */
export const SPECIAL_CHAR_FORBIDDEN_REGEX = /^[\p{L}\p{N}\s\/\-]+$/u;
export const FULL_NAME_LETTERS_ONLY_REGEX = /^[\p{L}\s]+$/u;

export function isValidGeneralText(val: string, minLen = 2, maxLen = 300): boolean {
  const sanitized = sanitizeTextField(val);
  if (sanitized.length < minLen || sanitized.length > maxLen) return false;
  return SPECIAL_CHAR_FORBIDDEN_REGEX.test(sanitized);
}

export function isValidFullName(val: string, minLen = 2, maxLen = 200): boolean {
  const sanitized = sanitizeTextField(val);
  if (sanitized.length < minLen || sanitized.length > maxLen) return false;
  return FULL_NAME_LETTERS_ONLY_REGEX.test(sanitized);
}

/**
 * Student ID / MSSV / Class ID Regex: letters, numbers, hyphen -, underscore _
 * Length: 2 to 15 characters
 */
export const CODE_KEY_REGEX = /^[a-zA-Z0-9_\-]{2,15}$/;

/**
 * Check if DOB is valid date dd/mm/yyyy
 */
export function isValidDateDDMMYYYY(dateStr: string): boolean {
  const sanitized = sanitizeTextField(dateStr);
  const parts = sanitized.split('/');
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
 * Check CPA / Decimal number
 */
export function isValidDecimalNumber(val: string): boolean {
  if (!val) return false;
  const sanitized = val.trim();
  const num = Number(sanitized);
  return !isNaN(num) && isFinite(num);
}

/**
 * National ID / CCCD Regex: Exactly 12 digits starting with '0' (e.g. 079203012345)
 */
export const NATIONAL_ID_REGEX = /^0\d{11}$/;

/**
 * Header Mapping definition matching Vietnamese & English aliases in CSV template.
 * Flexible normalized headers (ignores multiple spaces, order & exact case).
 */
const HEADER_ALIASES: Record<string, keyof CsvCredentialRow> = {
  // 1. STT
  'stt': 'stt',
  'số thứ tự': 'stt',
  'no': 'stt',

  // 2. MSSV
  'mã sv / mssv': 'student_id',
  'mã sv': 'student_id',
  'mssv': 'student_id',
  'mã sinh viên': 'student_id',
  'studentid': 'student_id',
  'student_id': 'student_id',

  // 3. Họ & tên đệm & Tên (hỗ trợ trường gộp hoặc 2 trường tách)
  'họ & tên đệm': 'last_name',
  'họ và tên đệm': 'last_name',
  'họ & đệm': 'last_name',
  'họ': 'last_name',
  'tên': 'first_name',
  'họ và tên': 'full_name',
  'họ & tên': 'full_name',
  'họ tên': 'full_name',
  'fullname': 'full_name',
  'full_name': 'full_name',

  // 4. Ngày sinh
  'ngày sinh': 'dob',
  'dob': 'dob',

  // 5. Nơi sinh
  'nơi sinh': 'place_of_birth',
  'place_of_birth': 'place_of_birth',

  // 6. Giới tính
  'giới tính': 'gender',
  'nữ': 'gender',
  'gender': 'gender',

  // 7. Số CCCD / Căn cước công dân
  'số cccd': 'national_id',
  'căn cước công dân': 'national_id',
  'cccd': 'national_id',
  'nationalid': 'national_id',
  'national_id': 'national_id',

  // 8. Loại bằng
  'loại bằng': 'degree_type',
  'degree_type': 'degree_type',

  // 9. Lớp / Khóa
  'lớp / khóa': 'class_id',
  'lớp': 'class_id',
  'khóa': 'class_id',
  'mã lớp': 'class_id',
  'classid': 'class_id',
  'class_id': 'class_id',

  // 10. Khoa / Viện
  'khoa / viện': 'faculty',
  'khoa': 'faculty',
  'viện': 'faculty',
  'faculty': 'faculty',

  // 11. Ngành học
  'ngành học': 'major',
  'ngành': 'major',
  'vi-major': 'major',
  'major': 'major',

  // 12. Chuyên ngành
  'chuyên ngành': 'specialization',
  'specialization': 'specialization',

  // 13. Điểm TBC (CPA)
  'điểm tbc (cpa)': 'cpa',
  'điểm tbc': 'cpa',
  'cpa': 'cpa',

  // 14. Xếp loại tốt nghiệp
  'xếp loại tốt nghiệp': 'classification',
  'xếp loại': 'classification',
  'vi-graduationclassification': 'classification',
  'classification': 'classification',

  // 15. Số hiệu bằng
  'số hiệu bằng': 'degree_number',
  'degree_number': 'degree_number',

  // 16. Số vào sổ gốc
  'số vào sổ gốc': 'register_number',
  'register_number': 'register_number',

  // Supplementary
  'năm tốt nghiệp': 'graduation_year',
  'graduationyear': 'graduation_year',
  'graduation_year': 'graduation_year',
  'hình thức đào tạo': 'mode_of_study',
  'vi-modeofstudy': 'mode_of_study',
  'mode_of_study': 'mode_of_study',
  'email trường': 'university_email',
  'universityemail': 'university_email',
  'university_email': 'university_email',
};

// Key required header groups (ignoring order & extra spaces)
export const REQUIRED_HEADER_GROUPS = [
  ['mã sv / mssv', 'mã sv', 'mssv', 'mã sinh viên', 'studentid', 'student_id'],
  ['họ & tên đệm', 'họ và tên đệm', 'họ & đệm', 'họ', 'họ và tên', 'họ & tên', 'họ tên', 'fullname', 'full_name'],
  ['ngày sinh', 'dob'],
  ['lớp / khóa', 'lớp', 'khóa', 'mã lớp', 'classid', 'class_id'],
];

/**
 * Extract 4-digit graduation year from string (e.g. DH19... -> 2019) or fallback to current year
 */
export function extractGraduationYear(classId: string, gradYearCol?: string): number {
  if (gradYearCol && /^\d{4}$/.test(gradYearCol.trim())) {
    return parseInt(gradYearCol.trim(), 10);
  }
  const match2Digits = classId.match(/(?:[a-zA-Z]+)(\d{2})/);
  if (match2Digits && match2Digits[1]) {
    const yr = parseInt(match2Digits[1], 10);
    return yr > 50 ? 1900 + yr : 2000 + yr;
  }
  const match4Digits = classId.match(/\b(19\d{2}|20\d{2})\b/);
  if (match4Digits && match4Digits[1]) {
    return parseInt(match4Digits[1], 10);
  }
  return new Date().getFullYear();
}

/**
 * Simple CSV parser handling quotes and delimiters
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
 * Filter out invalid rows and recreate clean CSV File
 */
export function filterValidCsvFile(csvText: string, invalidRowNumbers: number[], fileName: string): File {
  const invalidSet = new Set(invalidRowNumbers);
  const parsed = parseCsvText(csvText);
  if (parsed.length === 0) return new File([], fileName, { type: 'text/csv' });

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

import * as XLSX from 'xlsx';

/**
 * Filter out invalid/unselected rows and recreate clean File (maintaining .xlsx or .csv format)
 */
export async function filterValidExcelOrCsvFile(
  file: File,
  invalidRowNumbers: number[],
  updatedRowValues?: Record<number, Record<string, string>>
): Promise<File> {
  const invalidSet = new Set(invalidRowNumbers);
  const parsed = await parseExcelOrCsvFile(file);
  if (parsed.length === 0) return file;

  // Lấy dòng header
  const headers = parsed[0];

  // Lọc chỉ giữ các dòng hợp lệ
  const validRows = parsed.filter((_, idx) => {
    if (idx === 0) return true; // Keep header
    return !invalidSet.has(idx);
  });

  // Tìm colIdx của student_id và class_id trong header để capslock toàn bộ
  const studentIdColIdx = headers.findIndex((h) => {
    const norm = normalizeHeaderString(h);
    return ['mã sv / mssv', 'mã sv', 'mssv', 'mã sinh viên', 'studentid', 'student_id'].includes(norm);
  });
  const classIdColIdx = headers.findIndex((h) => {
    const norm = normalizeHeaderString(h);
    return ['lớp / khóa', 'lớp', 'khóa', 'mã lớp', 'classid', 'class_id'].includes(norm);
  });

  validRows.forEach((row, rowIdx) => {
    if (rowIdx === 0) return;
    if (studentIdColIdx !== -1 && row[studentIdColIdx]) {
      row[studentIdColIdx] = row[studentIdColIdx].toUpperCase();
    }
    if (classIdColIdx !== -1 && row[classIdColIdx]) {
      row[classIdColIdx] = row[classIdColIdx].toUpperCase();
    }

    // Nếu có giá trị cập nhật/được sửa thủ công, ghi đè vào cell tương ứng
    const originalRowIndex = parsed.indexOf(row);
    const updates = updatedRowValues ? updatedRowValues[originalRowIndex] : null;
    if (updates) {
      Object.entries(updates).forEach(([fieldKey, newVal]) => {
        const colIdx = headers.findIndex(
          (h) => normalizeHeaderString(h) === normalizeHeaderString(fieldKey)
        );
        if (colIdx !== -1) {
          row[colIdx] = ['student_id', 'class_id'].includes(fieldKey) ? newVal.toUpperCase() : newVal;
        }
      });
    }
  });

  const fileNameLower = file.name.toLowerCase();
  if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
    const worksheet = XLSX.utils.aoa_to_sheet(validRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new File([excelBuffer], file.name, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // Trường hợp file CSV
  const csvLines = validRows.map((row) =>
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
  return new File([cleanedCsvText], file.name, { type: 'text/csv' });
}

/**
 * Reads an uploaded CSV or XLSX file and parses it into 2D string matrix
 */
export async function parseExcelOrCsvFile(file: File): Promise<string[][]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, raw: false, defval: '' });
    return rows.map((row) => row.map((cell) => String(cell || '').trim()));
  }

  // File CSV
  const csvText = await file.text();
  return parseCsvText(csvText);
}
/**
 * Core validation function for 2D string data parsed from CSV or XLSX
 */
export function validateParsedRows(parsed: string[][]): ParseCsvResult {
  if (parsed.length === 0) {
    return {
      headersValid: false,
      hasNoData: true,
      missingColumns: ['Mã SV / MSSV', 'Họ & Tên', 'Ngày sinh', 'Lớp / Khóa'],
      errors: [],
      rows: [],
    };
  }

  const rawHeaders = parsed[0].map((h) => h.trim());
  const normalizedHeaders = rawHeaders.map((h) => normalizeHeaderString(h));

  // Check required groups independent of header ordering or spacing
  const missingColumns: string[] = [];
  const fieldMapping: (keyof CsvCredentialRow | null)[] = normalizedHeaders.map((h) => {
    return HEADER_ALIASES[h] || null;
  });

  const hasStudentId = normalizedHeaders.some((h) => REQUIRED_HEADER_GROUPS[0].includes(h));
  const hasFullName = normalizedHeaders.some((h) => REQUIRED_HEADER_GROUPS[1].includes(h));
  const hasDob = normalizedHeaders.some((h) => REQUIRED_HEADER_GROUPS[2].includes(h));
  const hasClassId = normalizedHeaders.some((h) => REQUIRED_HEADER_GROUPS[3].includes(h));

  if (!hasStudentId) missingColumns.push('Mã SV / MSSV');
  if (!hasFullName) missingColumns.push('Họ & Tên');
  if (!hasDob) missingColumns.push('Ngày sinh');
  if (!hasClassId) missingColumns.push('Lớp / Khóa');

  if (missingColumns.length > 0) {
    return {
      headersValid: false,
      hasNoData: parsed.length <= 1,
      missingColumns,
      errors: [],
      rows: [],
    };
  }

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
  const mappedData: CsvCredentialRow[] = [];
  const keyMap = new Map<string, number>();

  for (let i = 1; i < parsed.length; i++) {
    const rowValues = parsed[i];
    const rowNumber = i;

    const rowObj: Record<string, string> = {};
    const credRow: CsvCredentialRow = {
      student_id: '',
      full_name: '',
      dob: '',
      class_id: '',
    };

    rawHeaders.forEach((rawH, idx) => {
      const val = rowValues[idx] || '';
      rowObj[rawH] = val;
      const targetField = fieldMapping[idx];
      if (targetField) {
        (credRow[targetField] as any) = val;
      }
    });
    rows.push(rowObj);

    // Xử lý ghép Họ & tên đệm + Tên nếu được tách thành 2 cột riêng
    if (!credRow.full_name && (credRow.last_name || credRow.first_name)) {
      credRow.full_name = [credRow.last_name, credRow.first_name].filter(Boolean).join(' ');
    }

    // Sanitize slash & spaces and convert student_id and class_id to uppercase
    const studentId = sanitizeTextField(credRow.student_id).toUpperCase();
    const fullName = sanitizeTextField(credRow.full_name);
    const dob = sanitizeTextField(credRow.dob);
    const classId = sanitizeTextField(credRow.class_id).toUpperCase();
    const major = sanitizeTextField(credRow.major || '');
    const placeOfBirth = sanitizeTextField(credRow.place_of_birth || '');
    const faculty = sanitizeTextField(credRow.faculty || '');
    const specialization = sanitizeTextField(credRow.specialization || '');
    const classification = sanitizeTextField(credRow.classification || '');
    const degreeNumber = sanitizeTextField(credRow.degree_number || '');
    const registerNumber = sanitizeTextField(credRow.register_number || '');
    const nationalId = sanitizeTextField(credRow.national_id || '');
    const degreeType = sanitizeTextField(credRow.degree_type || '');
    const modeStudy = sanitizeTextField(credRow.mode_of_study || '');
    const cpa = (credRow.cpa || '').trim();

    // Updates back into credRow
    credRow.student_id = studentId;
    credRow.full_name = fullName;
    credRow.dob = dob;
    credRow.class_id = classId;
    credRow.degree_type = degreeType;
    credRow.major = major;
    credRow.place_of_birth = placeOfBirth;
    credRow.faculty = faculty;
    credRow.specialization = specialization;
    credRow.classification = classification;
    credRow.degree_number = degreeNumber;
    credRow.register_number = registerNumber;
    credRow.national_id = nationalId;
    credRow.mode_of_study = modeStudy;

    // Bỏ qua các dòng hoàn toàn trống hoặc không có dữ liệu Mã sinh viên / Họ tên
    const hasAnyContent = Object.values(rowObj).some((v) => v && v.trim().length > 0);
    const rawStudentId = (credRow.student_id || '').trim();
    if (!hasAnyContent || !rawStudentId) {
      continue;
    }

    // 1. KIỂM TRA TRÙNG LẶP NỘI BỘ TRƯỚC: [student_id + class_id]
    // Nếu bị trùng -> Chỉ báo lỗi trùng, không kiểm tra tiếp các lỗi format
    const uniqueKey = `${studentId.toUpperCase()}_${classId.toUpperCase()}`;
    if (keyMap.has(uniqueKey)) {
      const prevRow = keyMap.get(uniqueKey)!;
      errors.push({
        row: rowNumber,
        type: 'duplicate',
        detailKey: 'errInternalDuplicateDetail',
        detailParams: { studentId, classId, prevRow },
        fieldName: 'Mã SV / Lớp',
        targetField: 'student_id',
        oldValue: `${studentId} - ${classId}`,
      });
      mappedData.push(credRow);
      continue; // Bỏ qua không kiểm tra các lỗi format nếu dòng đã bị trùng
    } else {
      keyMap.set(uniqueKey, rowNumber);
    }

    // 2. KIỂM TRA ĐỊNH DẠNG (FORMAT) NẾU DÒNG KHÔNG BỊ TRÙNG:
    // 2.1. Mã SV / MSSV: letters, numbers, -, _ (2-15 chars)
    if (!CODE_KEY_REGEX.test(studentId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidStudentId',
        detailParams: { val: studentId },
        fieldName: 'Mã SV / MSSV',
        targetField: 'student_id',
        oldValue: studentId,
      });
    }

    // 2. Họ & tên: 2-200 chars, chỉ cho phép chữ cái và khoảng trắng (không chứa số hoặc ký tự đặc biệt)
    if (!isValidFullName(fullName, 2, 200)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidFullname',
        fieldName: 'Họ và tên',
        targetField: 'full_name',
        oldValue: fullName,
      });
    }

    // 3. Ngày sinh: dd/mm/yyyy
    if (!isValidDateDDMMYYYY(dob)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errFormatDobDetail',
        detailParams: { val: dob },
        fieldName: 'Ngày sinh',
        targetField: 'dob',
        oldValue: dob,
      });
    }

    // 4. Lớp / Khóa: letters, numbers, -, /, _, spaces (2-15 chars limit)
    if (!CODE_KEY_REGEX.test(classId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidClassId',
        detailParams: { val: classId },
        fieldName: 'Lớp / Khóa',
        targetField: 'class_id',
        oldValue: classId,
      });
    }

    // 5. CPA: Must be decimal number if present
    if (cpa && !isValidDecimalNumber(cpa)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidCpaDetail',
        detailParams: { val: cpa },
        fieldName: 'Điểm TBC (CPA)',
        targetField: 'cpa',
        oldValue: cpa,
      });
    }

    // 6. Năm tốt nghiệp (nếu có): từ 1930 đến (Năm hiện tại + 3)
    const rawGradYear = (credRow.graduation_year || '').trim();
    if (rawGradYear) {
      const gYearNum = parseInt(rawGradYear, 10);
      const maxAllowedYear = new Date().getFullYear() + 3;
      if (isNaN(gYearNum) || gYearNum < 1930 || gYearNum > maxAllowedYear) {
        errors.push({
          row: rowNumber,
          type: 'format',
          detailKey: 'errInvalidGradYear',
          detailParams: { val: rawGradYear, max: maxAllowedYear },
          fieldName: 'Năm tốt nghiệp',
          targetField: 'graduation_year',
          oldValue: rawGradYear,
        });
      }
    }

    // 7. Chuẩn hóa Giới tính: N/Nữ/Female -> 'N', còn lại -> '' (Nam/Male/null)
    const genderRaw = (credRow.gender || '').trim().toUpperCase();
    if (['N', 'NỮ', 'NU', 'FEMALE'].includes(genderRaw)) {
      credRow.gender = 'N';
    } else {
      credRow.gender = '';
    }

    // 8. Kiểm tra Nơi sinh (phải thuộc danh sách 63 Tỉnh/Thành nếu nhập)
    if (placeOfBirth && !VIETNAM_PROVINCES.some((p) => p.toLowerCase() === placeOfBirth.toLowerCase())) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidPlaceOfBirthList',
        detailParams: { val: placeOfBirth },
        fieldName: 'Nơi sinh',
        targetField: 'place_of_birth',
        oldValue: placeOfBirth,
      });
    }

    // 9. Kiểm tra Xếp loại tốt nghiệp (phải thuộc danh sách Xuất sắc, Giỏi, Khá, Trung bình nếu nhập)
    if (classification && !CLASSIFICATION_OPTIONS.some((c) => c.toLowerCase() === classification.toLowerCase())) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidClassificationList',
        detailParams: { val: classification },
        fieldName: 'Xếp loại tốt nghiệp',
        targetField: 'classification',
        oldValue: classification,
      });
    }

    // 10. Kiểm tra Loại bằng / Loại chứng chỉ (phải thuộc danh sách nếu nhập)
    if (degreeType && degreeType !== 'Bằng tốt nghiệp đại học' && !DEGREE_TYPES.some((d) => d.label.toLowerCase() === degreeType.toLowerCase())) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidDegreeTypeList',
        detailParams: { val: degreeType },
        fieldName: 'Loại bằng',
        targetField: 'degree_type',
        oldValue: degreeType,
      });
    }

    // 11. Kiểm tra Hình thức đào tạo (phải thuộc danh sách Chính quy, Vừa học vừa làm, Đào tạo từ xa nếu nhập)
    if (modeStudy && !MODE_OF_STUDY_OPTIONS.some((m) => m.toLowerCase() === modeStudy.toLowerCase())) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidModeOfStudyList',
        detailParams: { val: modeStudy },
        fieldName: 'Hình thức đào tạo',
        targetField: 'mode_of_study',
        oldValue: modeStudy,
      });
    }

    // 12. Kiểm tra Số CCCD / National ID (nếu có): Bắt buộc 12 chữ số và bắt đầu bằng số 0
    if (nationalId && !NATIONAL_ID_REGEX.test(nationalId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidNationalIdDetail',
        detailParams: { val: nationalId },
        fieldName: 'Số CCCD',
        targetField: 'national_id',
        oldValue: nationalId,
      });
    }

    // 13. General text rules for optional text fields
    const optionalTextFields: [keyof CsvCredentialRow, string, string][] = [
      ['faculty', 'Khoa / Viện', faculty],
      ['major', 'Ngành học', major],
      ['specialization', 'Chuyên ngành', specialization],
      ['degree_number', 'Số hiệu bằng', degreeNumber],
      ['register_number', 'Số vào sổ gốc', registerNumber],
    ];

    for (const [fKey, fLabel, val] of optionalTextFields) {
      if (val && !isValidGeneralText(val, 2, 300)) {
        errors.push({
          row: rowNumber,
          type: 'format',
          detailKey: 'errInvalidGeneralText',
          detailParams: { field: fLabel, val },
          fieldName: fLabel,
          targetField: fKey,
          oldValue: val,
        });
      }
    }

    mappedData.push(credRow);
  }

  return {
    headersValid: true,
    hasNoData: false,
    missingColumns: [],
    errors,
    rows,
    mappedData,
  };
}

/**
 * Backward-compatible helper for plain CSV text string
 */
export function validateCsvContent(csvText: string): ParseCsvResult {
  const parsed = parseCsvText(csvText);
  return validateParsedRows(parsed);
}
