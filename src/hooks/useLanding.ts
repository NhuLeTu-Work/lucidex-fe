import { useApp } from '../app/AppContext';
import { useNavigate } from 'react-router';

export function useLanding() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();

  const handleVerifierClick = () => {
    setRole('verifier');
    navigate('/verifier');
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