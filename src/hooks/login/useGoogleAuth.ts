import { googleAuthApi } from '@/api/endpoints/owner/googleAuthApi';

// Định nghĩa interface tối thiểu cần thiết — để dùng chung được cho cả Login lẫn Register state
interface GoogleAuthDeps {
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useGoogleAuth(
  state: GoogleAuthDeps,
  navigate: any,
  setRole: any
) {
  const { setError, setIsLoading } = state;

  const handleGoogleAuth = async (credential: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await googleAuthApi(credential);

      if (response.success && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }

        setRole('owner');
        navigate('/owner');
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;

      if (errorCode === 'PASSWORD_ACCOUNT_OAUTH_LOGIN_NOT_ALLOWED') {
        setError('errorPasswordAccountOauth');
      } else if (errorCode === 'INVALID_GOOGLE_TOKEN') {
        setError('errorInvalidGoogleToken');
      } else if (errorCode === 'GOOGLE_EMAIL_NOT_VERIFIED') {
        setError('errorGoogleEmailNotVerified');
      } else if (status === 409) {
        setError('errorGoogleAccountConflict');
      } else {
        setError('errorServer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleAuth };
}