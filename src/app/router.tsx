import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './App';
import { ProtectedRoute } from '../components/app/ProtectedRoute';
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/LoginPage';
import { Register } from '../pages/RegisterPage';
import { VerifyLinkPage } from '../pages/VerifyLinkPage';
import { OwnerPortal } from '../pages/OwnerPortal';
import { IssuerPortal } from '../pages/IssuerPortal';
import { VerifierPortal } from '../pages/VerifierPortal';
import { AdminPortal } from '../pages/AdminPortal';

export const router = createBrowserRouter([
  {
    element: <AppLayout />, // header + <Outlet/>
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/verify', element: <VerifyLinkPage /> },
      { path: '/owner', element: <ProtectedRoute allowedRole="owner"><OwnerPortal /></ProtectedRoute> },
      { path: '/issuer', element: <ProtectedRoute allowedRole="issuer"><IssuerPortal /></ProtectedRoute> },
      { path: '/verifier', element: <ProtectedRoute allowedRole="verifier"><VerifierPortal /></ProtectedRoute> },
      { path: '/admin', element: <ProtectedRoute allowedRole="admin"><AdminPortal /></ProtectedRoute> },
    ],
  },
]);