import { useRef, useEffect, useCallback } from 'react';
import { Award } from 'lucide-react';
// IMPORT thẳng type Owner và Credential từ mockData
import { mockCredentials, currentOwner } from '../../data/mockData';
import type { Owner, Credential } from '../../data/mockData'; 

export function OwnerCredentials({ t }: { t: (k: string) => string }) {
  const myCreds = mockCredentials.filter(c => c.studentId === currentOwner.studentId);

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('myCredentials')}</h1>
      {myCreds.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noCredentials')}</p>
      ) : (
        <div className="space-y-6">
          {myCreds.map(cred => (
            // Truyền trực tiếp, KHÔNG CẦN ÉP KIỂU "as..." nữa
            <TiltCredentialCard key={cred.id} cred={cred} owner={currentOwner} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// Thay đổi type ở đây thành type chuẩn của hệ thống
function TiltCredentialCard({ cred, owner, t }: { cred: Credential; owner: Owner; t: (k: string) => string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

  const updateBounding = useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) boundingRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }, []);

  useEffect(() => {
    updateBounding();
    window.addEventListener('resize', updateBounding);
    return () => window.removeEventListener('resize', updateBounding);
  }, [updateBounding]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = boundingRef.current;
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const xPct = (mouseX / width) * 100;
    const yPct = (mouseY / height) * 100;
    const xNorm = (mouseX / width - 0.5) * 2;
    const yNorm = (mouseY / height - 0.5) * 2;
    const rotateX = yNorm * -10;
    const rotateY = xNorm * 10;
    if (cardRef.current) cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    if (glareRef.current) glareRef.current.style.background = `radial-gradient(circle at ${xPct}% ${yPct}%, rgba(255,255,255,0.3), transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    if (glareRef.current) glareRef.current.style.background = 'radial-gradient(circle, transparent, transparent)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card relative overflow-hidden rounded-2xl border p-8 max-w-2xl"
      style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}
    >
      <div className="tilt-card-content relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-mono opacity-50 mb-1">{t('mockDataLabel')}</p>
            <h3 className="font-display text-xl">{t('degreeInfo')}</h3>
          </div>
          <div className="w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--ct-border)' }}>
            <Award size={20} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="opacity-50">{t('ownerName')}:</span> <span className="font-semibold">{owner.name}</span></div>
          <div><span className="opacity-50">{t('studentId')}:</span> <span className="font-mono">{owner.studentId}</span></div>
          <div><span className="opacity-50">{t('degreeType')}:</span> <span>{cred.degreeType}</span></div>
          <div><span className="opacity-50">{t('major')}:</span> <span>{owner.major}</span></div>
          <div><span className="opacity-50">{t('graduationYear')}:</span> <span>{owner.graduationYear}</span></div>
          <div><span className="opacity-50">{t('classHonors')}:</span> <span>{owner.honors}</span></div>
          <div><span className="opacity-50">GPA:</span> <span className="font-semibold">{owner.gpa}</span></div>
          <div><span className="opacity-50">{t('issueDate')}:</span> <span>{cred.issueDate}</span></div>
        </div>
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--ct-border)' }}>
          <p className="text-xs font-mono opacity-40 break-all">Hash: {cred.hash}</p>
        </div>
      </div>
      <div ref={glareRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}