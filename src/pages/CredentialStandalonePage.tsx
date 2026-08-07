import { useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getOwnerCredentialDetailApi } from '@/api/endpoints/owner/getOwnerCredentialDetailApi';
import { mapOwnerCredentialToCertificateData } from '@/components/certificates/ctuGraduation/certificateData';
import GraduationCertificate from '@/components/certificates/ctuGraduation/GraduationCertificate';
import { CredentialCoverReveal } from '@/components/certificates/CredentialCoverReveal';
import { apiClient } from '@/api/api';
import { Loader2, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CertificateData } from '@/components/certificates/ctuGraduation/certificateData';

/**
 * Interface cho PostMessage bridge với Mobile App (React Native WebView / Flutter Webview)
 */
interface PostMessagePayload {
  type: 'LOADED' | 'ANIMATION_END' | 'CLOSE' | 'ERROR' | 'LANG_CHANGED';
  payload?: any;
}

export function CredentialStandalonePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const initialLangParam = searchParams.get('lang');

  const [data, setData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'vi' | 'en'>(
    initialLangParam === 'en' ? 'en' : 'vi'
  );
  const [, startTransition] = useTransition();

  // Helper gửi message tới mobile webview bridge
  const postToNative = (message: PostMessagePayload) => {
    const jsonString = JSON.stringify(message);

    // React Native WebView Bridge
    if ((window as any).ReactNativeWebView?.postMessage) {
      (window as any).ReactNativeWebView.postMessage(jsonString);
    }
    
    // Flutter Webview / Standard Webview Channel
    if ((window as any).flutter_inappwebview?.callHandler) {
      (window as any).flutter_inappwebview.callHandler('NativeBridge', message);
    } else if ((window as any).NativeBridge?.postMessage) {
      (window as any).NativeBridge.postMessage(jsonString);
    }

    // Standard Parent Window (if embedded in iframe)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(jsonString, '*');
    }
  };

  const fetchCredential = async () => {
    if (!id) {
      setError('Thiếu ID bằng cấp');
      setIsLoading(false);
      postToNative({ type: 'ERROR', payload: { code: 'MISSING_ID', message: 'Thiếu ID bằng cấp' } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (tokenFromUrl) {
        headers['Authorization'] = `Bearer ${tokenFromUrl}`;
      }

      const res = tokenFromUrl 
        ? (await apiClient.get(`/api/v1/owner/credentials/${id}`, { headers })).data
        : await getOwnerCredentialDetailApi(id);

      if (res.success && res.data) {
        const certData = mapOwnerCredentialToCertificateData(res.data);
        startTransition(() => {
          setData(certData);
          setIsLoading(false);
        });
        postToNative({ type: 'LOADED', payload: { id, title: certData.vi.fullName } });
      } else {
        throw new Error(res.message || 'Không tìm thấy dữ liệu bằng cấp');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải bằng cấp';
      setError(msg);
      setIsLoading(false);
      postToNative({ type: 'ERROR', payload: { code: 'FETCH_FAILED', message: msg } });
    }
  };

  useEffect(() => {
    fetchCredential();
  }, [id, tokenFromUrl]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        postToNative({ type: 'ANIMATION_END', payload: { id } });
      }, 2100);
      return () => clearTimeout(timer);
    }
  }, [data, id]);

  const handleClose = () => {
    postToNative({ type: 'CLOSE', payload: { id } });
  };

  const toggleLanguage = (lang: 'vi' | 'en') => {
    setActiveLang(lang);
    postToNative({ type: 'LANG_CHANGED', payload: { id, lang } });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#2A3439] text-white flex flex-col justify-between items-center overflow-hidden select-none p-3 sm:p-6">
      {/* Top Bar: Nút Đóng & Bộ chuyển ngôn ngữ dạng Tab */}
      <div className="w-full max-w-lg flex items-center justify-between z-50">
        {!isLoading && data ? (
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
            <button
              onClick={() => toggleLanguage('vi')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeLang === 'vi'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span>Tiếng Việt</span>
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeLang === 'en'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span>English</span>
            </button>
          </div>
        ) : <div />}

        <button
          onClick={handleClose}
          className="p-2.5 bg-black/40 hover:bg-black/60 active:bg-black/80 rounded-full text-white/80 hover:text-white backdrop-blur-md transition-all border border-white/10"
          title="Đóng"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* State Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 my-auto">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <p className="text-sm font-medium text-amber-200/90 tracking-wide">
            Đang tải dữ liệu văn bằng...
          </p>
        </div>
      )}

      {/* State Lỗi / Fallback */}
      {!isLoading && error && (
        <div className="max-w-md mx-4 p-6 bg-red-950/40 border border-red-500/30 rounded-2xl backdrop-blur-md text-center space-y-4 shadow-2xl my-auto">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-200">Không thể hiển thị văn bằng</h3>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchCredential}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-600 rounded-xl text-sm font-medium transition-all shadow-md active:scale-95"
          >
            <RefreshCw size={16} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Main View Bằng cấp (Layout Mobile Chuyển Trang) */}
      {!isLoading && data && (
        <div className="relative w-full max-w-md flex-1 flex flex-col justify-center items-center my-auto">
          {/* Layer Bằng cấp chính (Hiển thị single page theo activeLang) */}
          <div className="relative w-full aspect-[820/1200] max-h-[75vh] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <GraduationCertificate
                data={data}
                activeLang={activeLang}
                isMobileMode={true}
              />
            </div>

            {/* Layer Cover Reveal trượt mở */}
            <CredentialCoverReveal
              logoUrl={data.logoUrl || '/ctuGraduation/ctuLogo.png'}
              title="BẰNG TỐT NGHIỆP"
              subtitle="CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
            />
          </div>
        </div>
      )}

      {/* Bottom Pagination & Navigation Controls */}
      {!isLoading && data && (
        <div className="w-full max-w-md flex items-center justify-between z-50 pt-2 pb-1 px-4">
          <button
            onClick={() => toggleLanguage(activeLang === 'vi' ? 'en' : 'vi')}
            disabled={activeLang === 'en'}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium transition-all ${
              activeLang === 'en' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/60 active:scale-95'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Trang tiếng Anh</span>
          </button>

          <span className="text-xs text-white/60 font-mono">
            {activeLang === 'en' ? '1 / 2' : '2 / 2'}
          </span>

          <button
            onClick={() => toggleLanguage(activeLang === 'vi' ? 'en' : 'vi')}
            disabled={activeLang === 'vi'}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium transition-all ${
              activeLang === 'vi' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/60 active:scale-95'
            }`}
          >
            <span>Trang tiếng Việt</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CredentialStandalonePage;
