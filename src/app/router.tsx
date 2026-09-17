import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './App';
import { ProtectedRoute } from '../components/app/ProtectedRoute';
import { Login } from '../pages/LoginPage';
import { Register } from '../pages/RegisterPage';
import { VerifyLinkPage } from '../pages/VerifyLinkPage';
import { OwnerPortal } from '../pages/OwnerPortal';
import { IssuerPortal } from '../pages/IssuerPortal';
import { VerifierPortal } from '../pages/VerifierPortal';
import { AdminPortal } from '../pages/AdminPortal';
import { SuperAdminPortal } from '@/pages/SuperAdminPortal';
import { CredentialStandalonePage } from '@/pages/CredentialStandalonePage';

// Lazy so that three.js and the landing stylesheet stay out of the main bundle
// and are never downloaded on the other routes.
const LandingPage = lazy(() => import('../features/landing/LandingPage'));

export const router = createBrowserRouter([
  {
    path: '/owner/view/credential/:id',
    element: <CredentialStandalonePage />,
  },
  {
    // Outside AppLayout: the landing page brings its own fixed header and
    // footer, and its sections are sized in whole viewport heights, which the
    // app header's h-16 + pt-16 would shift.
    path: '/',
    element: (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#060911' }} />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    element: <AppLayout />, // header + <Outlet/>
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/verify', element: <VerifyLinkPage /> },
      { path: '/owner', element: <ProtectedRoute allowedRole="owner"><OwnerPortal /></ProtectedRoute> },
      { path: '/issuer', element: <ProtectedRoute allowedRole="issuer"><IssuerPortal /></ProtectedRoute> },
      { path: '/verifier', element: <ProtectedRoute allowedRole="verifier"><VerifierPortal /></ProtectedRoute> },
      { path: '/admin', element: <ProtectedRoute allowedRole="admin"><AdminPortal /></ProtectedRoute> },
      { path: '/super', element: <ProtectedRoute allowedRole="super"><SuperAdminPortal /></ProtectedRoute> },
      { path: '/invite/setup-password', element: <Register /> },
    ],
  },
]);