import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { AppProvider, useApp } from './app/AppContext'
import { router } from './app/router'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function MainApp() {
  const { lang } = useApp();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} key={lang} locale={lang}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <MainApp />
    </AppProvider>
  </StrictMode>
)