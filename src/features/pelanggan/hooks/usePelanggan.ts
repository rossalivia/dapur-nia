import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pelanggan } from '@/types';

export function usePelanggan() {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'pelanggan'), orderBy('dibuat_pada', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Pelanggan[];
        setPelangganList(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to pelanggan:', err);
        setError('Gagal memuat data pelanggan dari server.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { pelangganList, loading, error };
}
