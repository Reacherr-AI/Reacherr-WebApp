import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract tokens from the URL sent by the Spring Boot backend
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    
    // Check for challenge-based flow (e.g. Google Auth needing Phone Verification)
    const challengeToken = searchParams.get('challengeToken');
    const challengeType = searchParams.get('challengeType');
    const target = searchParams.get('target');

    if (accessToken && refreshToken) {
      // Use your AuthContext login to save these sessions
      login({ accessToken, refreshToken, userId, username, type: 'JWT' });
      navigate('/agents');
    } else if (challengeToken && challengeType) {
      // Handle the case where further verification is needed (skipped email, needs phone)
      // Redirect to /login which acts as the AuthPage container
      navigate('/login', { 
        state: { 
          challengeToken, 
          challengeType, 
          target: target || '' 
        },
        replace: true
      });
    } else {
      console.error("OAuth Callback failed: Missing tokens");
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return <div>Finishing sign-in...</div>;
};

export default AuthCallback;