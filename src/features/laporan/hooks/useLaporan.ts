import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LaporanHarian, Pesanan } from '@/types';
import { aggregateLaporan } from '../services/laporanService';

export function useLaporan(selectedDate: string) {
  const [laporan, setLaporan] = useState<LaporanHarian | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);

    const q = query(collection(db, 'pesanan'), where('tanggal', '==', selectedDate));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Pesanan[];

        const report = aggregateLaporan(orders, selectedDate);
        setLaporan(report);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to laporan:', err);
        setError('Gagal memuat data laporan dari server.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDate]);

  return { laporan, loading, error };
}
