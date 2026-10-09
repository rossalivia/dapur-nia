import { Pelanggan } from '@/types';

export type UserRole = 'admin' | 'pelanggan';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  profile?: Pelanggan | null;
}

export interface RegisterDTO {
  email: string;
  password: string;
  nama: string;
  no_whatsapp: string;
  alamat: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}
