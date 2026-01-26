import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  signin, signup , verifyEmail, addPhone, verifyPhone 
} from '../api/auth'; // Ensure these match your client.ts exports

// Modular Components
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import OTPVerificationForm from '../components/auth/OTPVerificationForm';
import AddPhoneForm from '../components/auth/AddPhoneForm';

const AuthPage: React.FC = () => {
  // Step 0: Login, Step 1: Signup, Step 2: Email OTP, Step 3: Add Phone, Step 4: Phone OTP
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string>("");
  const [userIdentifier, setUserIdentifier] = useState(""); // Stores email or phone for 'target'

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // --- HANDLERS ---
    const handleSignIn = async (credentials: any) => {
        setIsLoading(true);
        try {
            const res = await signin(credentials);
            
            if (res.data.type === 'JWT') {
            login(res.data);
            navigate('/agents');
            } else if (res.data.type === 'CHALLENGE') {
            setChallengeToken(res.data.challengeToken);
            
            switch (res.data.challengeType) {
                case 'EMAIL':
                setUserIdentifier(credentials.username);
                setStep(2); // OTPVerificationForm (Email)
                break;
                case 'ADD_PHONE':
                setStep(3); // AddPhoneForm
                break;
                case 'PHONE':
                // You may need to handle getting the phone number target here
                setStep(4); // OTPVerificationForm (Phone)
                break;
            }
            }
        } catch (err) {
            const message = getErrorMessage(err);
            addToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

  const handleSignupSubmit = async (data: any) => {
    setIsLoading(true);
    try {
        const res = await signup(data); // Hits /api/v1/auth/signup
        console.log(res.data.challengeToken);
        setChallengeToken(res.data.challengeToken);
        setUserIdentifier(data.username);
        setStep(2);
    } catch (err: any) {
        // - Capture 409 Conflict error
        const message = getErrorMessage(err);
        addToast(message, "error");
    } finally {
        setIsLoading(false);
    }
    };

  const handleEmailVerify = async (otp: string) => {
    setIsLoading(true);
    try {
        const res = await verifyEmail({ 
            challengeToken, otp, target: userIdentifier, otpType: 'EMAIL' 
        }); // Hits /api/v1/verify/email
        setChallengeToken(res.data.challengeToken); // Update with new token
        setStep(3);
    } catch (err) {
        const message = getErrorMessage(err);
        addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAdd = async (phone: string) => {
    setIsLoading(true);
    try {
        const res = await addPhone({ challengeToken, phone }); // Hits /api/v1/phone/add
        setChallengeToken(res.data.challengeToken);
        setUserIdentifier(phone); // Update target to phone number
        setStep(4);
    } catch (err) {
        const message = getErrorMessage(err);
        addToast(message, "error");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePhoneVerify = async (otp: string) => {
    setIsLoading(true);
    try {
        const res = await verifyPhone({ 
        challengeToken, otp, target: userIdentifier, otpType: 'PHONE' 
        }); 
        
        // Check if response contains JWT tokens directly
        if (res.data.type === 'JWT') {
        login(res.data); // Stores tokens and sets global auth state
        addToast("Account verified and logged in!", "success");
        navigate('/agents'); // Go straight to dashboard
        } else {
        // Fallback if your backend behavior varies
        addToast("Verification complete. Please sign in.", "success");
        setStep(0);
        }
    } catch (err) {
        const message = getErrorMessage(err);
        addToast(message, "error");
    } finally {
        setIsLoading(false);
    }
  };

  const getErrorMessage = (err: any): string => {
    // Check if the error matches your specific JSON format
        const backendMessage = err.response?.data?.error;
        if (!backendMessage) return "An unexpected error occurred. Please try again.";

        // Handle specific technical constraints (like your foreign key example)
        if (backendMessage.includes("violates foreign key constraint")) {
            return "This account cannot be modified because it has active sessions. Please log out from other devices.";
        }
        
        // Handle other common backend errors found in your screenshots
        if (backendMessage.includes("already exists")) {
            return "An account with this email already exists."; //
        }
        return backendMessage;
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl">
        
        {step === 0 && (
          <LoginForm 
            onSubmit={handleSignIn} 
            onSwitchToSignup={() => setStep(1)} 
            isLoading={isLoading} 
          />
        )}

        {step === 1 && (
          <SignupForm 
            onSubmit={handleSignupSubmit} 
            onBackToLogin={() => setStep(0)} 
            isLoading={isLoading} 
          />
        )}

        {step === 2 && (
          <OTPVerificationForm 
            title="Verify Email"
            description={`Enter the code sent to ${userIdentifier}`}
            onSubmit={handleEmailVerify}
            isLoading={isLoading}
          />
        )}

        {step === 3 && (
          <AddPhoneForm 
            onSubmit={handlePhoneAdd}
            isLoading={isLoading}
          />
        )}

        {step === 4 && (
          <OTPVerificationForm 
            title="Verify Phone"
            description={`Enter the code sent to ${userIdentifier}`}
            onSubmit={handlePhoneVerify}
            isLoading={isLoading}
          />
        )}

      </div>
    </div>
  );
};

export default AuthPage;