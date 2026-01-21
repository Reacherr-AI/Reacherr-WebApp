import axios from 'axios';
import { S3MetaDto, VoiceDto } from '../types';
import { globalLogout } from '../context/AuthContext';

export const API_URL = import.meta.env.VITE_API_URL;
export const GOOGLE_LOGIN_URL = `${API_URL}/oauth2/authorization/google`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized – logging out');
      globalLogout();
    }
    return Promise.reject(error);
  }
);

export const getAllAgentsData = (businessId: number) => {
  return apiClient.get(`/agent/${businessId}`);
};

export const getCallSettingsData = () => {
  return apiClient.get(`/agent/callSettingsData/`);
}

export const getPhoneNumbers = (businessId: number): Promise<{ data: Record<number, string> }> => {
  return apiClient.get(`/api/phone-numbers/subscribed`);
};

export const getVoices = (): Promise<{ data: VoiceDto[] }> => {
  return apiClient.get('/voice');
};

export const postAgent = (data: {
  agentId?: number;
  businessId: number;
  description: string;
  knowledgeBase: S3MetaDto[];
  lang: string;
  numberId: number;
  name: string;
  voiceId: string;
}) => {
  console.log('Sending Agent Creating Request:', data);
  return apiClient.post('/agent/save', data);
};

export const uploadKnowledgeBase = (fileName: string, contentType: string, businessId: number, fileSize: number, lastModified: number) => {
  return apiClient.get(`/storage/upload-KBase/${businessId}`, {
    params: { fileName, contentType, fileSize, lastModified }
  });
};

export const deleteAgent = (businessId: number, agentId: number) => {
  return apiClient.delete(`/agent/${businessId}`, {
    params: { agentId }
  })
}

export const deleteKnowledgeBase = (businessId: number, fileId: string, contentType: string) => {
  return apiClient.delete(`/storage/delete-KBase/${businessId}`, { params: { fileId, contentType } });
};

export const getKnowledgeBaseDownloadUrl = (businessId: number, fileId: string, contentType: string) => {
  return apiClient.get(`/storage/get-kb/${businessId}`, {
    params: { fileId, contentType }
  });
}

export const getVoiceUrl = (voiceId: string) => {
  return apiClient.get(`/storage/voice`, { params: { voiceId } });
};

export const getRecordingUrl = (recordingObjKey: string) => {
  return apiClient.get(`/storage/recording`, { params: { recordingObjKey } })
}

export default apiClient;