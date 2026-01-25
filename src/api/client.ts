import axios from 'axios';
import { S3MetaDto, VoiceDto } from '../types';
import { globalLogout } from '../context/AuthContext';
import { DashboardAnalyticsDto } from '@/types/dashboard';

export const API_URL = 'http://localhost:8080/';
// export const GOOGLE_LOGIN_URL = `${API_URL}/oauth2/authorization/google`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJST0xFX09XTkVSIl0sInN1YiI6InJhai4zMC4xMi4yazAxQGdtYWlsLmNvbSIsImlhdCI6MTc2OTMzOTQ5MywiZXhwIjoxNzY5MzQwMzkzfQ.9C3S2oCPyhzCgeBwc8pjfIO5GOpxq_4zZ_yFBL9v0sAZLNuJYlgUiZ95_Kp6EU2F4d0OaYXn4miBoGAw3AKiww"
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

export const getAgentConversationData = () =>{
  console.log('Fetching Agent Conversation Config Data for llm and Audio settings');
  return apiClient.get(`/api/v1/conversation/config`);
}

export const getTemplates = (): Promise<{ data: Array<{ id: string, name: string, description: string }> }> => {
  return apiClient.get('/api/v1/agent/templates');
};

export const getAllAgentsData = () => {
  return apiClient.get(`/api/v1/agent/`);
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