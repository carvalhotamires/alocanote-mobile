import { api } from './api';
import { UpdateUserProfileRequestDTO, UserResponseDTO } from '../types';

export const userService = {
  async listUsers(): Promise<UserResponseDTO[]> {
    const response = await api.get<UserResponseDTO[]>('/users');
    return response.data;
  },

  async getMyProfile(): Promise<UserResponseDTO> {
    const response = await api.get<UserResponseDTO>('/users/me');
    return response.data;
  },

  async updateMyProfile(data: UpdateUserProfileRequestDTO): Promise<UserResponseDTO> {
    const response = await api.put<UserResponseDTO>('/users/me', data);
    return response.data;
  },
};
