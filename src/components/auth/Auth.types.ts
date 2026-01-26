// API Payloads
export interface SignupRequest {
  name: string;
  password: string;
  username: string; // Used as Email
}

export interface VerifyOTPRequest {
  challengeToken: string;
  otp: string;
  target: string; // Email or Phone number
  otpType: 'EMAIL' | 'PHONE';
}

export interface AddPhoneRequest {
  challengeToken: string;
  phone: string;
}

export interface SigninRequest {
  username: string;
  password: string;
}

// API Responses
export interface AuthResponse {
  type: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
}

export interface ChallengeResponse {
  challengeToken: string;
}