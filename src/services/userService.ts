import { api } from './api';
import { UserResponseDTO } from '../types';

export const userService = {
  async listUsers(): Promise<UserResponseDTO[]> {
    const response = await api.get<UserResponseDTO[]>('/users');
    return response.data;
  },
};
