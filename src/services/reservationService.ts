import { api } from './api';
import { CreateReservationRequestDTO, ReservationResponseDTO } from '../types';

export const reservationService = {
  async createReservation(data: CreateReservationRequestDTO): Promise<ReservationResponseDTO> {
    const response = await api.post<ReservationResponseDTO>('/reservations', data);
    return response.data;
  },

  async listMyReservations(): Promise<ReservationResponseDTO[]> {
    const response = await api.get<ReservationResponseDTO[]>('/reservations');
    return response.data;
  },

  async getReservationById(id: number): Promise<ReservationResponseDTO> {
    const response = await api.get<ReservationResponseDTO>(`/reservations/${id}`);
    return response.data;
  },

  async checkInReservation(id: number): Promise<ReservationResponseDTO> {
    const response = await api.patch<ReservationResponseDTO>(`/reservations/${id}/check-in`);
    return response.data;
  },

  async cancelReservation(id: number): Promise<ReservationResponseDTO> {
    const response = await api.patch<ReservationResponseDTO>(`/reservations/${id}/cancel`);
    return response.data;
  },

  async finishReservation(id: number): Promise<ReservationResponseDTO> {
    const response = await api.patch<ReservationResponseDTO>(`/reservations/${id}/finish`);
    return response.data;
  },
};
