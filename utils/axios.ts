// utils/axios.ts
import axios from 'axios';
import { useAuthorization } from '~/composables/useAuthorization';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
});

instance.interceptors.request.use(config => {
  console.log('Request headers:', config.headers);
  return config;
}, error => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  response => {
    console.log('Response headers:', response.headers);
    return response;
  },
  error => {
    console.error('Axios response error:', error);

    if (error.response?.status === 401) {
      const { clearUser } = useAuthorization();
      clearUser();
    }
    alert(error.response.data.message);
    return Promise.reject(error);
  }
);

export default instance;