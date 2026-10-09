import { User as FirebaseUser } from 'firebase/auth';
import { Pelanggan } from '@/types';

export type UserRole = 'admin' | 'pelanggan';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  profile?: Pelanggan | null;
}

export interface RegisterPelangganDTO {
  email: string;
  password: string;
  nama: string;
  no_whatsapp: string;
  alamat: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
