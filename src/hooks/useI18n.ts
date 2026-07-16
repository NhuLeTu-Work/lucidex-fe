import { useState, useCallback } from 'react';
import { translations } from '../i18n';
import type { Lang } from '../i18n';

export function useI18n() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ct-lang') as Lang;
      // Kiểm tra xem saved lang có thực sự tồn tại trong translations không
      if (saved && translations[saved]) {
        return saved;
      }
    }
    return 'en'; // Default fallback
  });

  const setLangPersistent = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('ct-lang', newLang);
  }, []);

  const t = useCallback((key: string) => {
    // Nếu không tìm thấy key trong ngôn ngữ hiện tại, trả về chính key đó
    return translations[lang][key] || key;
  }, [lang]);

  return { lang, setLang: setLangPersistent, t };
}