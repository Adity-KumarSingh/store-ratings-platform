import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  },
);

export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: { message: string }[] }
      | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(' ');
    if (data?.message) return data.message;
    return err.message;
  }
  return 'Something went wrong.';
}

export default api;
