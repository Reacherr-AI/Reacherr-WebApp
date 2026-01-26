import axios from 'axios';
import { S3MetaDto, VoiceDto } from '../types';

export const API_URL = 'http://localhost:8080/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the current access token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('temp_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Token Expiration and Silent Refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 1. If the error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      // 2. If no refresh token exists, redirect to login
      if (!refreshToken) {
        console.warn('No refresh token found – logging out');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('Access token expired. Attempting silent refresh...');
        
        // 3. Call the refresh endpoint
        // Note: Use a separate axios instance to avoid infinite interceptor loops
        const res = await axios.post(`${API_URL}api/v1/auth/refresh`, {
          refreshToken: refreshToken
        });

        // 4. If refresh is successful, update tokens and retry
        if (res.data.type === 'JWT') {
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          localStorage.setItem('temp_access_token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken); // Rotate the refresh token
          
          // 5. Update the original request headers and retry it
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 6. If the refresh token itself is expired, clear all and force login
        console.error('Refresh token expired or invalid');
        localStorage.removeItem('temp_access_token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- API Methods --- [Citations apply to existing structure in image_f1a041.jpg]

export const getAgentConversationData = () => {
  return apiClient.get(`/api/v1/conversation/config`);
};

export const getTemplates = (): Promise<{ data: Array<{ id: string, name: string, description: string }> }> => {
  return apiClient.get('/api/v1/agent/templates');
};

export const getAllAgentsData = () => {
  return apiClient.get(`/api/v1/agent/`);
};

export const postAgent = (data: any) => {
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
  });
};

export const deleteKnowledgeBase = (businessId: number, fileId: string, contentType: string) => {
  return apiClient.delete(`/storage/delete-KBase/${businessId}`, { params: { fileId, contentType } });
};

export const getKnowledgeBaseDownloadUrl = (businessId: number, fileId: string, contentType: string) => {
  return apiClient.get(`/storage/get-kb/${businessId}`, {
    params: { fileId, contentType }
  });
};

export const getVoiceUrl = (voiceId: string) => {
  return apiClient.get(`/storage/voice`, { params: { voiceId } });
};

export const getRecordingUrl = (recordingObjKey: string) => {
  return apiClient.get(`/storage/recording`, { params: { recordingObjKey } });
};

export default apiClient;