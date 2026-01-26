import apiClient  from './client';
import { 
  SignupRequest, VerifyOTPRequest, AddPhoneRequest, 
  SigninRequest, AuthResponse, ChallengeResponse 
} from '@/components/auth/Auth.types';

export const signup = (data:SignupRequest)=>
    apiClient.post<ChallengeResponse>('/api/v1/auth/signup', data);

export const verifyEmail = (data: VerifyOTPRequest) =>  
  apiClient.post<ChallengeResponse>('/api/v1/verify/email', data);

export const addPhone = (data: AddPhoneRequest) => 
  apiClient.post<ChallengeResponse>('/api/v1/phone/add', data);

export const verifyPhone = (data: VerifyOTPRequest) => 
  apiClient.post<void>('/api/v1/verify/phone', data);

export const signin = (data: SigninRequest) => 
  apiClient.post<AuthResponse>('/api/v1/auth/signin', data);
