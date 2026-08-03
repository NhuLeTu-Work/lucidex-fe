/**
 * Chuyển đổi thời gian ISO 8601 UTC (VD: "2026-07-24T03:17:28.273000")
 * Sang định dạng "hh:mm dd/mm/yyyy" ở múi giờ UTC+7
 *
 * @param {string} dateString - Chuỗi thời gian ISO UTC gốc từ BE.
 * @returns {string} - Chuỗi đã format, VD: "10:17 24/07/2026"
 */
export const timeUtil = (dateString: string): string => {
  if (!dateString) return '';

  let cleanDateString = dateString.trim();
  cleanDateString = cleanDateString.replace(/(\.\d{3})\d*$/, '$1'); // 273000 -> 273
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(cleanDateString)) {
    cleanDateString += 'Z';
  }

  const date = new Date(cleanDateString);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedParts = formatter.formatToParts(date);
  const extractPart = (type: string) =>
    formattedParts.find((part) => part.type === type)?.value || '00';

  const day = extractPart('day');
  const month = extractPart('month');
  const year = extractPart('year');
  const hour = extractPart('hour');
  const minute = extractPart('minute');

  return `${hour}:${minute} ${day}/${month}/${year}`;
};

/**
 * Chuyển đổi bất kỳ giá trị ngày/chuỗi ngày nào (VD: "2004-05-27", ISO string, Date object)
 * Về định dạng chuẩn "dd/mm/yyyy" đồng nhất ở tất cả ngôn ngữ.
 *
 * @param {any} val - Chuỗi ngày hoặc đối tượng Date.
 * @returns {string} - Chuỗi định dạng dd/mm/yyyy, VD: "27/05/2004"
 */
export const formatDateDDMMYYYY = (val: any): string => {
  if (!val) return '—';

  let str = String(val).trim();
  if (!str) return '—';

  // Lấy phần ngày trước T nếu là chuỗi ISO
  if (str.includes('T')) {
    str = str.split('T')[0];
  }

  // Dạng DD/MM/YYYY hoặc D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${d}/${m}/${y}`;
  }

  // Dạng YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const parts = str.split('-');
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  // Khởi tạo đối tượng Date làm phương án dự phòng
  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
};