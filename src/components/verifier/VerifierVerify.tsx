import { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import type { VerifyResultState, VerifiedData } from '../../types/verifier';

interface VerifyProps {
  t: (k: string) => string;
  result: VerifyResultState;
  verifiedData: VerifiedData | null;
  onVerify: (code: string) => void;
  quotaUsed: number;
}

export function VerifierVerify({ t, result, verifiedData, onVerify, quotaUsed }: VerifyProps) {
  const [code, setCode] = useState('');
  const [showStampArea, setShowStampArea] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const dropCenter = useRef({ x: 0, y: 0 });
  const stampCenter = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const hasVerified = useRef(false);

  const getPositions = useCallback(() => {
    if (!dropZoneRef.current || !stampRef.current) return;
    const dropRect = dropZoneRef.current.getBoundingClientRect();
    const stampRect = stampRef.current.getBoundingClientRect();
    dropCenter.current = { x: dropRect.left + dropRect.width / 2, y: dropRect.top + dropRect.height / 2 };
    stampCenter.current = { x: stampRect.left + stampRect.width / 2, y: stampRect.top + stampRect.height / 2 };
  }, []);

  const animate = useCallback(() => {
    if (!stampRef.current) return;
    const rect = stampRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    currentPos.current.x += (targetPos.current.x - cx) * 0.15;
    currentPos.current.y += (targetPos.current.y - cy) * 0.15;
    stampRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
    const dist = Math.hypot(dropCenter.current.x - cx, dropCenter.current.y - cy);
    if (dist < 100 && !hasVerified.current && guideRef.current) {
      const gx = dropCenter.current.x - stampCenter.current.x;
      const gy = dropCenter.current.y - stampCenter.current.y;
      guideRef.current.style.transform = `translate(${gx}px, ${gy}px)`;
      guideRef.current.style.opacity = '1';
    }
    if (dist > 150 && guideRef.current) guideRef.current.style.opacity = '0';
    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [animate]);

  const handleMouseDown = () => {
    isDragging.current = true;
    stampRef.current?.classList.add('dragging');
    getPositions();
    const dist = Math.hypot(dropCenter.current.x - stampCenter.current.x, dropCenter.current.y - stampCenter.current.y);
    if (dist < 50) {
      offset.current = { x: stampCenter.current.x - dropCenter.current.x, y: stampCenter.current.y - dropCenter.current.y };
    } else {
      offset.current = { x: 0, y: 0 };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    stampRef.current?.classList.remove('dragging');
    getPositions();
    const dist = Math.hypot(dropCenter.current.x - stampCenter.current.x, dropCenter.current.y - stampCenter.current.y);
    if (dist < 50) {
      targetPos.current = { x: dropCenter.current.x - stampCenter.current.x + offset.current.x, y: dropCenter.current.y - stampCenter.current.y + offset.current.y };
      dropZoneRef.current?.classList.add('verified');
      hasVerified.current = true;
      if (guideRef.current) guideRef.current.style.opacity = '0';
    } else {
      dropZoneRef.current?.classList.remove('verified');
      hasVerified.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    targetPos.current = { x: e.clientX + offset.current.x, y: e.clientY + offset.current.y };
  };

  const handleCheck = () => {
    if (!code.trim()) return;
    onVerify(code);
    setShowStampArea(true);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('verifyCredential')}</h1>

      {quotaUsed >= 20 && (
        <div className="p-4 rounded-xl border mb-6" style={{ borderColor: '#f59e0b', background: 'var(--ct-accent-amber)' }}>
          <p className="text-sm text-amber-700">{t('quotaExceeded')}</p>
        </div>
      )}

      <div className="max-w-lg mb-8">
        <div className="flex gap-2">
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="abc123" className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button onClick={handleCheck} disabled={!code.trim() || quotaUsed >= 20} className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80 disabled:opacity-40" style={{ background: '#000' }}>
            {result === 'checking' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('check')}
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50">{t('mockDataLabel')} — Try: abc123, def456, ghi789, jkl012</p>
      </div>

      {showStampArea && result === 'valid' && verifiedData && (
        <div className="relative select-none" style={{ height: '400px' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <p className="text-sm mb-4 opacity-60">Drag the VERIFIED stamp onto the credential document below:</p>

          <div ref={dropZoneRef} className="drop-zone absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 rounded-xl" style={{ background: 'var(--ct-surface)' }}>
            <div className="text-center">
              <Shield size={24} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">{verifiedData.ownerName}</p>
              <p className="text-xs opacity-60">{verifiedData.degreeType}</p>
              <p className="text-xs font-mono opacity-40 mt-1">{verifiedData.hash}</p>
            </div>
          </div>

          <div ref={guideRef} className="stamp-guide absolute w-[80px] h-[80px] rounded-full" style={{ top: '50%', left: '50%', marginLeft: '-40px', marginTop: '-40px', opacity: 0 }} />

          <div ref={stampRef} className="stamp-element absolute" style={{ top: '20px', left: '20px' }} onMouseDown={handleMouseDown}>
            <div className="w-[80px] h-[80px] rounded-full border-4 border-black flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
              <span className="text-white text-[8px] font-black tracking-widest text-center leading-tight">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {result === 'valid' && verifiedData && (
        <div className="mt-8 p-6 rounded-2xl border animate-in fade-in" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-semibold text-green-700">{t('credentialValid')}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="opacity-50">{t('ownerName')}:</span> <span className="font-semibold">{verifiedData.ownerName}</span></div>
            <div><span className="opacity-50">{t('institution')}:</span> <span>CICT - Can Tho University</span></div>
            <div><span className="opacity-50">{t('degreeType')}:</span> <span>{verifiedData.degreeType}</span></div>
            <div><span className="opacity-50">GPA:</span> <span>{verifiedData.gpa}</span></div>
          </div>
        </div>
      )}

      {result === 'invalid' && (
        <div className="mt-8 p-6 rounded-2xl border animate-in fade-in" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red)' }}>
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />
            <span className="font-semibold text-red-700">{t('credentialInvalid')}</span>
          </div>
        </div>
      )}
    </div>
  );
}