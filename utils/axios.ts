// utils/axios.ts
import axios from 'axios';
// 引入 useAuthorization
import { useAuthorization } from '~/composables/useAuthorization';


const instance = axios.create({
  // baseURL: 'http://localhost:3000/api',
  baseURL: '/api',
  timeout: 10000
});

instance.interceptors.request.use(config => {
  console.log('Request headers:', config.headers);
  return config;
});

instance.interceptors.response.use(
  response => {
    console.log('Response headers:', response.headers);
    // response.headers['content-type'] = 'application/json';
    return response;
  },
  error => {
    console.error('Axios response error:', error);

    if (error.response?.status === 401) {
      // 可以在这里添加自动登出逻辑
      const { clearUser } = useAuthorization(); // 假设 useAuthorization 提供 clearUser 方法
      clearUser();
    }
    alert(error.response.data.message)
    // return Promise.reject(error.response.data);
  }
);
export default instance;