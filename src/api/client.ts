import axios from 'axios';
import { globalLogout } from '../context/AuthContext';
import { S3Meta, Template, ReacherrLLM, VoiceAgent } from '../types';
export const API_URL = 'http://localhost:8080/';
// export const GOOGLE_LOGIN_URL = `${API_URL}/oauth2/authorization/google`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJST0xFX09XTkVSIl0sInN1YiI6ImxpdmVraXR0ZXN0MTZAZ21haWwuY29tIiwiaWF0IjoxNzY5MzY1NTg2LCJleHAiOjE3Njk5NzAzODZ9.PZghnRExUZhVT9g7LQh-Jrk8seQ359m2-rN51pW_ES-Jkn8SwE56KKJrUythU5uG6D2c4M34pmuBW_uvGcT00A"
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

export const getTemplates = (): Promise<{ data: Template[] }> => {
  return apiClient.get('/api/v1/templates');
};

export const getAllAgentsData = () => {
  return apiClient.get(`/api/v1/list-agent-dashboard`);
};



export const postAgent = (data: {
  agentId?: number;
  businessId: number;
  description: string;
  knowledgeBase: S3Meta[];
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

export const createAgentFromTemplate = (templateId: string) => {
  return apiClient.post<{agentId: string, responseEngine: { llmId: string }} & Partial<VoiceAgent>>(`/api/v1/create-agent-from-template/${templateId}`);
};

export const getReacherrLlm = (llmId: string) => {
  return apiClient.get<ReacherrLLM>(`/api/v1/get-reacherr-llm/${llmId}`);
};

export const createReacherrLlm = (data: Partial<ReacherrLLM>) => {
  return apiClient.post<ReacherrLLM>(`/api/v1/create-reacherr-llm`, data);
};

export const createVoiceAgent = (data: Partial<VoiceAgent>) => {
  return apiClient.post<VoiceAgent>(`/api/v1/create-voice-agent`, data);
};

export default apiClient;