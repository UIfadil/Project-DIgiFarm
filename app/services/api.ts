// app/services/api.ts
import axios from 'axios';

const api = axios.create({
  // Dia akan otomatis mengambil nilai dari .env masing-masing orang
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export default api;