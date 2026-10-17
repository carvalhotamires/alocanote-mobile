export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PROJETISTA = 'PROJETISTA',
  CONFERENTE = 'CONFERENTE',
  CONSULTOR_VENDAS = 'CONSULTOR_VENDAS',
  OUTROS = 'OUTROS'
}

export enum NotebookStatus {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  MANUTENCAO = 'MANUTENCAO'
}

export enum ReservationStatus {
  AGENDADO = 'AGENDADO',
  CHECKED_IN = 'CHECKED_IN',
  CANCELADO = 'CANCELADO',
  FINALIZADO = 'FINALIZADO'
}

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  customRole?: string | null;
  accessLevel?: string;
  profilePictureUrl?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  createdAt?: string;
}

export interface User extends UserResponseDTO {}

export interface RegisterUserRequestDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  customRole?: string | null;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  type: string;
  email: string;
  name: string;
  role: string;
}

export interface SendSmsRequestDTO {
  phone: string;
}

export interface TokenValidationRequestDTO {
  phone: string;
  code: string;
}

export interface NotebookResponseDTO {
  id: number;
  name: string;
  modelDescription: string;
  status: NotebookStatus;
}

export interface CreateNotebookRequestDTO {
  name: string;
  modelDescription: string;
  status: NotebookStatus;
}

export interface LocationResponseDTO {
  id: number;
  name: string;
  address: string;
  cep: string;
}

export interface CreateReservationRequestDTO {
  notebookId: number;
  startTime: string; // ISO-8601 ex: '2026-11-15T09:00:00'
  endTime: string;   // ISO-8601 ex: '2026-11-15T12:00:00'
  locationId: number;
  purpose: string;
}

export interface ReservationResponseDTO {
  id: number;
  userId: number;
  userName: string;
  notebookId: number;
  notebookName: string;
  notebookModel: string;
  startTime: string;
  endTime: string;
  locationId: number;
  locationName: string;
  status: ReservationStatus;
  purpose: string;
}

export interface StandardError {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
}
