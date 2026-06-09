import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

console.log("=== BASE URL ===", process.env.EXPO_PUBLIC_API_URL);

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    // Jangan kirim token saat login/register
    const isAuthRoute =
      config.url?.includes("/login") || config.url?.includes("/register");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      config.transformRequest = [(data) => data];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log("=== API ERROR ===");
      console.log("URL   :", error.config?.url);
      console.log("Status:", error.response?.status);
      console.log("Data  :", JSON.stringify(error.response?.data));
    }
    return Promise.reject(error);
  },
);

export default api;
