import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Fetch backend application health
 */
export async function getApiHealth() {
  const response = await apiClient.get('/v1/health');
  return response.data;
}

/**
 * Fetch PostgreSQL database connection health
 */
export async function getDbHealth() {
  const response = await apiClient.get('/v1/health/db');
  return response.data;
}

