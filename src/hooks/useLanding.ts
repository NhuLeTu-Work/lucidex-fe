import { useApp } from '../app/AppContext';
import { useNavigate } from 'react-router';

export function useLanding() {
  const { t } = useApp();
  const navigate = useNavigate();

  const handleVerifierClick = () => {
    const token = localStorage.getItem('access_token');

    if (token) 
      return true;

   return false;
  };

  const handleVerifyClick = () => {
    navigate('/verify');
  };

  return {
    t,
    handleVerifierClick,
    handleVerifyClick,
  };
}