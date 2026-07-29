/**
 * Chuyển đổi thời gian ISO 8601 UTC (VD: "2026-07-24T03:17:28.273000")
 * Sang định dạng "hh:mm dd/mm/yyyy" ở múi giờ UTC+7
 *
 * @param {string} dateString - Chuỗi thời gian ISO UTC gốc từ BE.
 * @returns {string} - Chuỗi đã format, VD: "10:17 24/07/2026"
 */
export const timeUtil = (dateString: string): string => {
  if (!dateString) return '';

  // 1. Chuẩn hóa: cắt bớt phần thập phân giây về tối đa 3 chữ số (ms),
  // và thêm 'Z' nếu chưa có để báo cho JS đây là UTC, không phải giờ local
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