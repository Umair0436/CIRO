import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ciro-backend-658608522807.us-central1.run.app',
  timeout: 120000,
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

export const fetchLogs = async () => {
  const response = await apiClient.get('/api/logs');
  return response.data;
};

export default apiClient;