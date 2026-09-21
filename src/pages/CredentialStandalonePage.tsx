import { useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getOwnerCredentialDetailApi } from '@/api/endpoints/owner/getOwnerCredentialDetailApi';
import { mapOwnerCredentialToCertificateData, sampleCertificateData } from '@/components/certificates/ctuGraduation/certificateData';
import GraduationCertificate from '@/components/certificates/ctuGraduation/GraduationCertificate';
import { CredentialCoverReveal } from '@/components/certificates/CredentialCoverReveal';
import { apiClient } from '@/api/api';
import { Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, BookOpen, Smartphone } from 'lucide-react';
import { OwnerShareCodeWidget } from '@/components/owner/OwnerShareCodeWidget';
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
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
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
    if (!id || id === 'preview' || id === 'sample' || id === 'demo') {
      startTransition(() => {
        setData(sampleCertificateData);
        setIsLoading(false);
      });
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
    if (data && id && id !== 'preview' && id !== 'sample' && id !== 'demo') {
      const timer = setTimeout(() => {
        postToNative({ type: 'ANIMATION_END', payload: { id } });
      }, 2100);
      return () => clearTimeout(timer);
    }
  }, [data, id]);

  const toggleLanguage = (lang: 'vi' | 'en') => {
    setActiveLang(lang);
    if (id && id !== 'preview' && id !== 'sample' && id !== 'demo') {
      postToNative({ type: 'LANG_CHANGED', payload: { id, lang } });
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#1e262b] text-white flex flex-col justify-between items-center overflow-hidden select-none p-3 sm:p-5">
      
      {/* Top Bar Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between z-50 py-1.5 px-3 border-b border-white/10 bg-black/20 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base text-amber-300">Bằng Tốt Nghiệp Đại Học</span>
          <span className="hidden sm:inline text-xs text-white/50">| Đại học Cần Thơ</span>
        </div>

        {/* Chuyển chế độ Desktop / Mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Dạng sách (2 trang)</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Dạng thẻ (1 trang)</span>
          </button>
        </div>
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

      {/* Main View Bằng cấp */}
      {!isLoading && data && (
        <div className="relative w-full flex-1 flex flex-col justify-center items-center my-auto overflow-hidden p-2">
          {viewMode === 'desktop' ? (
            /* Desktop View: Sách mở 2 trang song song */
            <div className="relative w-full max-w-4xl aspect-[1640/1200] max-h-[78vh] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <GraduationCertificate
                  data={data}
                  isMobileMode={false}
                />
              </div>
            </div>
          ) : (
            /* Mobile View: 1 trang đơn theo ngôn ngữ */
            <div className="relative w-full max-w-md aspect-[820/1200] max-h-[72vh] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center">
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
          )}
        </div>
      )}

      {/* Share verify code widget */}
      {!isLoading && data && id && id !== 'preview' && id !== 'sample' && id !== 'demo' && (
        <OwnerShareCodeWidget credentialId={id} className="bottom-20 sm:bottom-24 z-[100]" />
      )}

      {/* Bottom Pagination & Navigation Controls (khi ở Mobile view) */}
      {!isLoading && data && viewMode === 'mobile' && (
        <div className="w-full max-w-md flex items-center justify-between z-50 pt-2 pb-1 px-2">
          <button
            onClick={() => toggleLanguage('en')}
            disabled={activeLang === 'en'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm font-medium transition-all ${
              activeLang === 'en' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 active:scale-95'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Tiếng Anh</span>
          </button>

          <span className="text-xs sm:text-sm text-white/60 font-mono">
            {activeLang === 'en' ? 'Trang 1 / 2' : 'Trang 2 / 2'}
          </span>

          <button
            onClick={() => toggleLanguage('vi')}
            disabled={activeLang === 'vi'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm font-medium transition-all ${
              activeLang === 'vi' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70 active:scale-95'
            }`}
          >
            <span>Tiếng Việt</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CredentialStandalonePage;
