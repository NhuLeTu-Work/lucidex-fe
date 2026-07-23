import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { AppProvider } from './app/AppContext'
import { router } from './app/router'
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import Provider

// 2. Lấy Client ID từ biến môi trường (.env) hoặc dán trực tiếp string vào đây (khuyên dùng .env)
const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </AppProvider>
  </StrictMode>
)