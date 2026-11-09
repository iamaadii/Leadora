import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always include HttpOnly cookies (for refreshToken)
});

// In-memory access token storage
let memoryAccessToken = null;

export function setMemoryToken(token) {
  memoryAccessToken = token;
}

export function getMemoryToken() {
  return memoryAccessToken;
}

export function clearMemoryToken() {
  memoryAccessToken = null;
}

// Request interceptor: attach Bearer token if present in memory
apiClient.interceptors.request.use(
  (config) => {
    if (memoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle token expiration and automatic refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent infinite loops
    const isAuthRoute =
      originalRequest.url.includes('/v1/auth/login') ||
      originalRequest.url.includes('/v1/auth/refresh') ||
      originalRequest.url.includes('/v1/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue concurrent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        setMemoryToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearMemoryToken();
        // Custom event so AuthContext can clean up user state
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Intercept demo environment read-only mutations and disabled exports
    if (error.response?.status === 403) {
      const code =
        error.response?.data?.error?.code ||
        error.response?.data?.code ||
        '';

      if (code === 'DEMO_READ_ONLY' || code === 'DEMO_EXPORT_DISABLED') {
        const message =
          code === 'DEMO_EXPORT_DISABLED'
            ? 'Action disabled in Demo Mode: Exporting CRM data is disabled in the live product demo.'
            : 'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.';

        window.dispatchEvent(
          new CustomEvent('app:toast', {
            detail: {
              type: 'warning',
              title: 'Demo Mode (Read-Only)',
              message,
            },
          }),
        );
      }
    }

    return Promise.reject(error);
  },
);

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
