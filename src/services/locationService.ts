import { api } from './api';
import { LocationResponseDTO } from '../types';

export const locationService = {
  async listLocations(): Promise<LocationResponseDTO[]> {
    const response = await api.get<LocationResponseDTO[]>('/locations');
    return response.data;
  },

  async getLocationByCep(cep: string): Promise<LocationResponseDTO> {
    const response = await api.get<LocationResponseDTO>(`/locations/cep/${cep}`);
    return response.data;
  },
};
