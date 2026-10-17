import { api } from './api';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterUserRequestDTO,
  SendSmsRequestDTO,
  TokenValidationRequestDTO,
  UserResponseDTO,
} from '../types';

export const authService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await api.post<LoginResponseDTO>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterUserRequestDTO): Promise<UserResponseDTO> {
    const response = await api.post<UserResponseDTO>('/users/register', data);
    return response.data;
  },

  async sendSms(data: SendSmsRequestDTO): Promise<void> {
    await api.post('/auth/send-sms', data);
  },

  async verifySms(data: TokenValidationRequestDTO): Promise<string> {
    const response = await api.post<string>('/auth/verify-sms', data);
    return response.data;
  },
};
