import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      config.transformRequest = [(data) => data]; // ✅ KUNCI: cegah Axios ubah FormData
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log('=== API ERROR ===');
      console.log('URL   :', error.config?.url);
      console.log('Status:', error.response?.status);
      console.log('Data  :', JSON.stringify(error.response?.data));
    }
    return Promise.reject(error);
  }
);

export default api;