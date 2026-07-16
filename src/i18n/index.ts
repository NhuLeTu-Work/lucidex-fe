import { vi } from './vi';
import { en } from './en';

// Gom tất cả các object ngôn ngữ vào một object chung
export const translations = {
  vi,
  en,
};

// Tự động suy luận Type cho Lang (sẽ tự động ra 'vi' | 'en')
export type Lang = keyof typeof translations;