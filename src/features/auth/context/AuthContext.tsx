import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  isEmailAdmin,
  loginUser,
  registerPelanggan,
  logoutUser,
  fetchPelangganProfile,
} from '../services/authService';
import { LoginDTO, RegisterPelangganDTO, UserRole } from '../types';
import { Pelanggan } from '@/types';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: Pelanggan | null;
  loading: boolean;
  error: string | null;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterPelangganDTO) => Promise<void>;
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
        if (isEmailAdmin(currentUser.email)) {
          setRole('admin');
          setProfile(null);
        } else {
          setRole('pelanggan');
          // Cari profil pelanggan berdasarkan email di Firestore
          try {
            if (currentUser.email) {
              const q = query(
                collection(db, 'pelanggan'),
                where('email', '==', currentUser.email.toLowerCase())
              );
              const snap = await getDocs(q);
              if (!snap.empty) {
                const docSnap = snap.docs[0];
                setProfile({ id: docSnap.id, ...docSnap.data() } as Pelanggan);
              }
            }
          } catch (e) {
            console.warn('Error fetching user profile:', e);
          }
        }
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

  const register = async (dto: RegisterPelangganDTO) => {
    setError(null);
    try {
      const res = await registerPelanggan(dto);
      setProfile(res.profile);
      setRole('pelanggan');
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
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
