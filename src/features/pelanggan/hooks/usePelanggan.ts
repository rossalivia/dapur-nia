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
    const colRef = collection(db, 'pelanggan');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Pelanggan[];

        items.sort((a, b) => {
          const getMillis = (t: any) => {
            if (!t) return 0;
            if (typeof t.toMillis === 'function') return t.toMillis();
            if (t.seconds) return t.seconds * 1000;
            return 0;
          };
          return getMillis(b.dibuat_pada) - getMillis(a.dibuat_pada);
        });

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
