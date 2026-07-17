import { useEffect, useRef } from 'react';
import { ArrowRight, Building2, GraduationCap, Users, Upload, UserCheck, Link2, ClipboardList } from 'lucide-react';
import { useLanding } from '../hooks/useLanding';
import { BlurRevealText } from '../components/landing/BlurRevealText';
import { FeatureCard } from '../components/landing/FeatureCard';
import { StepRow } from '../components/landing/StepRow';

export function LandingPage() {
  const { t, handleVerifierClick, handleVerifyClick } = useLanding();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ct-bg) 0%, transparent 50%, var(--ct-bg) 100%)' }} />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
          <BlurRevealText text={t('heroTitle')} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6" />
          <p className="text-lg sm:text-xl mb-10 font-light" style={{ color: 'var(--ct-text-secondary)' }}>{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleVerifierClick} className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-3xl transition-all hover:scale-105" style={{ background: '#000' }}>
              {t('heroCTA1')}
              <ArrowRight size={18} />
            </button>
            <button onClick={handleVerifyClick} className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-3xl border-2 transition-all hover:scale-105" style={{ borderColor: 'var(--ct-text)', color: 'var(--ct-text)' }}>
              {t('heroCTA2')}
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-24 px-6" style={{ background: 'var(--ct-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">{t('whatDoWeOffer')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Building2 size={32} />}
              title={t('forUniversities')}
              desc={t('featUniDesc')}
              roleLabel={t('lblThisIsIssuer') || 'This is our Issuer'}
            />
            <FeatureCard 
              icon={<GraduationCap size={32} />}
              title={t('forStudents')}
              desc={t('featStuDesc')}
              roleLabel={t('lblThisIsOwner') || 'This is our Owner'}
            />
            <FeatureCard 
              icon={<Users size={32} />}
              title={t('forEmployers')}
              desc={t('featEmpDesc')}
              roleLabel={t('lblThisIsVerifier') || 'This is our Verifier'}
            />
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-24 px-6" style={{ background: 'var(--ct-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">{t('howItWorks')}</h2>
          <div className="space-y-12">
            <StepRow num="01" icon={<Upload size={24} />} title={t('step1')} desc="Issuer uploads graduation data via CSV batch file." align="left" />
            <StepRow num="02" icon={<UserCheck size={24} />} title={t('step2')} desc="Student claims their digital degree using MSSV + OTP or CCCD OCR fallback." align="right" />
            <StepRow num="03" icon={<Link2 size={24} />} title={t('step3')} desc="HR verifies credentials via public link or HR Portal with full audit trail." align="left" />
            <StepRow num="04" icon={<ClipboardList size={24} />} title={t('step4')} desc="Every verification is logged immutably with timestamp and identity." align="right" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="" className="h-6 w-6" />
            <span className="font-display text-sm">Lucidex</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--ct-text-secondary)' }}>{t('footerCopy')}</p>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono rounded border" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text-secondary)' }}>{t('mockDataLabel')}</span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded border" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text-secondary)' }}>{t('phase1Label')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}