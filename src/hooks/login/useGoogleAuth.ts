import { googleAuthApi } from '@/api/endpoints/owner/googleAuthApi';
import { saveTokens } from '../useSessionTimer';
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
        saveTokens(response.data.access_token, response.data.refresh_token, response.data.refresh_token_expires_at);
        setRole('owner');
        navigate('/owner');
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      if (status === 401 && errorCode === 'INVALID_GOOGLE_TOKEN') {
        setError('errorInvalidGoogleToken');
      } else if (status === 403 && errorCode === 'GOOGLE_EMAIL_NOT_VERIFIED') {
        setError('errorGoogleEmailNotVerified');
      } else if (status === 403 && errorCode === 'INACTIVE_ACCOUNT') {
        setError('errorInactiveAccount');
      } else if (status === 409 && errorCode === 'GOOGLE_ACCOUNT_MISMATCH') {
        setError('errorGoogleAccountMismatch');
      } else if (status === 409 && errorCode === 'PASSWORD_ACCOUNT_OAUTH_LOGIN_NOT_ALLOWED') {
        setError('errorEmailExistsPassword');
      } else if (status === 422) {
        setError('errorValidationGoogleAuth');
      } else if (status === 503 && errorCode === 'GOOGLE_OAUTH_UNAVAILABLE') {
        setError('errorGoogleOauthUnavailable');
      } else {
        // Fallback
        setError('errorActionFailed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleAuth };
}