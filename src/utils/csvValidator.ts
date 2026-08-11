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

export function isValidGeneralText(val: string, minLen = 2, maxLen = 300): boolean {
  const sanitized = sanitizeTextField(val);
  if (sanitized.length < minLen || sanitized.length > maxLen) return false;
  return SPECIAL_CHAR_FORBIDDEN_REGEX.test(sanitized);
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

/**
 * Core validation function for CSV content
 */
export function validateCsvContent(csvText: string): ParseCsvResult {
  const parsed = parseCsvText(csvText);
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

    // Sanitize slash & spaces
    const studentId = sanitizeTextField(credRow.student_id);
    const fullName = sanitizeTextField(credRow.full_name);
    const dob = sanitizeTextField(credRow.dob);
    const classId = sanitizeTextField(credRow.class_id);
    const major = sanitizeTextField(credRow.major || '');
    const placeOfBirth = sanitizeTextField(credRow.place_of_birth || '');
    const faculty = sanitizeTextField(credRow.faculty || '');
    const specialization = sanitizeTextField(credRow.specialization || '');
    const classification = sanitizeTextField(credRow.classification || '');
    const degreeNumber = sanitizeTextField(credRow.degree_number || '');
    const registerNumber = sanitizeTextField(credRow.register_number || '');
    const nationalId = sanitizeTextField(credRow.national_id || '');
    const degreeType = sanitizeTextField(credRow.degree_type || '') || 'Bằng tốt nghiệp đại học';
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

    // Validation checks:
    // 1. Mã SV / MSSV: letters, numbers, -, _ (2-15 chars)
    if (!CODE_KEY_REGEX.test(studentId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidStudentId',
        detailParams: { val: studentId },
      });
    }

    // 2. Họ & tên: 2-200 chars, general text rules
    if (fullName.length < 2 || fullName.length > 200 || !isValidGeneralText(fullName, 2, 200)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidFullname',
      });
    }

    // 3. Ngày sinh: dd/mm/yyyy
    if (!isValidDateDDMMYYYY(dob)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errFormatDobDetail',
        detailParams: { val: dob },
      });
    }

    // 4. Lớp / Khóa: letters, numbers, -, /, _, spaces (2-15 chars limit)
    if (!CODE_KEY_REGEX.test(classId)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidClassId',
        detailParams: { val: classId },
      });
    }

    // 5. CPA: Must be decimal number if present
    if (cpa && !isValidDecimalNumber(cpa)) {
      errors.push({
        row: rowNumber,
        type: 'format',
        detailKey: 'errInvalidCpaDetail',
        detailParams: { val: cpa },
      });
    }

    // 6. Năm tốt nghiệp (nếu có cột năm tốt nghiệp): từ 1930 đến (Năm hiện tại + 3)
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
        });
      }
    }

    // 6. General text rules for optional text fields
    const optionalTextFields: [string, string][] = [
      ['place_of_birth', placeOfBirth],
      ['faculty', faculty],
      ['major', major],
      ['specialization', specialization],
      ['classification', classification],
      ['degree_number', degreeNumber],
      ['register_number', registerNumber],
    ];

    for (const [fieldName, val] of optionalTextFields) {
      if (val && !isValidGeneralText(val, 2, 300)) {
        errors.push({
          row: rowNumber,
          type: 'format',
          detailKey: 'errInvalidGeneralText',
          detailParams: { field: fieldName, val },
        });
      }
    }

    // Internal duplicate check [student_id + class_id]
    const uniqueKey = `${studentId.toUpperCase()}_${classId.toUpperCase()}`;
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
