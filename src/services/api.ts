import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_STORAGE_KEY = '@alocanote:token';
export const USER_STORAGE_KEY = '@alocanote:user';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Erro ao recuperar token do storage:', error);
  }
  return config;
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export function getApiErrorMessage(error: any, fallbackMessage = 'Ocorreu um erro inesperado.'): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
}