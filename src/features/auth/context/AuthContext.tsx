import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  isEmailAdmin,
  loginUser,
  loginWithGoogle,
  registerPelanggan,
  logoutUser,
} from '../services/authService';
import { LoginDTO, RegisterDTO, UserRole } from '../types';
import { Pelanggan } from '@/types';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: Pelanggan | null;
  loading: boolean;
  error: string | null;
  login: (dto: LoginDTO) => Promise<void>;
  loginGoogle: () => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<Pelanggan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let assignedRole: UserRole = 'pelanggan';
        let foundProfile: Pelanggan | null = null;

        // Cek jika email masuk daftar admin default
        if (isEmailAdmin(currentUser.email)) {
          assignedRole = 'admin';
        }

        try {
          if (currentUser.email) {
            const q = query(
              collection(db, 'pelanggan'),
              where('email', '==', currentUser.email.toLowerCase())
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const docSnap = snap.docs[0];
              const data = docSnap.data();
              if (data.role === 'admin') {
                assignedRole = 'admin';
              }
              foundProfile = { id: docSnap.id, ...data } as Pelanggan;
            } else if (assignedRole === 'pelanggan') {
              // Profil fallback jika didaftarkan via console atau Google
              foundProfile = {
                id: currentUser.uid,
                nama: currentUser.displayName || currentUser.email.split('@')[0],
                no_whatsapp: '0812' + Math.floor(10000000 + Math.random() * 90000000).toString(),
                alamat: 'Alamat pengiriman belum diatur',
              };
            }
          }
        } catch (e) {
          console.warn('Error fetching user profile:', e);
        }

        setRole(assignedRole);
        setProfile(foundProfile);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (dto: LoginDTO) => {
    setError(null);
    try {
      await loginUser(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const loginGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (dto: RegisterDTO) => {
    setError(null);
    try {
      const res = await registerPelanggan(dto);
      setProfile(res.profile);
      setRole(dto.role || 'pelanggan');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    await logoutUser();
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        loading,
        error,
        login,
        loginGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
