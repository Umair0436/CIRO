import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.7:8000',
  timeout: 60000,
});

export const runDemo = async () => {
  const response = await apiClient.get('/api/demo');
  return response.data;
};

export const ingestCrisis = async (text) => {
  const response = await apiClient.post('/api/ingest', { text });
  return response.data;
};

export const analyzeCrisis = async (sessionId) => {
  const response = await apiClient.post('/api/analyze', { session_id: sessionId });
  return response.data;
};

export default apiClient;