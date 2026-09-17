import { useRef } from 'react';

import { useApp } from '@/app/AppContext';

import './landing.css';
import { HeroSection } from './components/HeroSection';
import { LandingFooter } from './components/LandingFooter';
import { LandingHeader } from './components/LandingHeader';
import { NationalSection } from './components/NationalSection';
import { ProblemSection } from './components/ProblemSection';
import { RolesWrapper } from './components/RolesWrapper';
import { VietnamMapLayer } from './components/VietnamMapLayer';
import { LANDING_ROUTES, hasAccessToken } from './links';
import { useLandingRuntime } from './useLandingRuntime';

/**
 * The Lucidex landing page, ported from the standalone Vite project in
 * D:\work\landing.
 *
 * It is registered outside AppLayout because it brings its own fixed header and
 * footer and its sections are sized in whole viewport heights - the app chrome
 * would double up and shift every one of them.
 *
 * Isolation: everything visual lives under `.lucidex-landing` (see landing.css);
 * the handful of rules that cannot be scoped - the html/body background, the
 * smooth scrolling and the menu scroll-lock - ride on a class that
 * useLandingRuntime puts on <html> and takes off again on unmount.
 */
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { role } = useApp();

  useLandingRuntime(rootRef);

  // "Log in" / "Register" become "Open app" once there is a session. The token
  // check is the app's existing one; the destination is the role's portal, the
  // same target the app header uses.
  const isAuthenticated = hasAccessToken() && role !== 'guest';
  const appHomePath = role !== 'guest' ? `/${role}` : LANDING_ROUTES.login;

  return (
    <div className="lucidex-landing" ref={rootRef}>
      <LandingHeader isAuthenticated={isAuthenticated} appHomePath={appHomePath} />

      {/* FEATURE 1: Fixed "liquid" Vietnam outline background layer */}
      <VietnamMapLayer />

      <HeroSection />
      <ProblemSection />

      {/* Sections 3-6, sharing the flight path overlay */}
      <RolesWrapper />

      {/* FEATURE 2: National section */}
      <NationalSection />

      <LandingFooter />
    </div>
  );
}
