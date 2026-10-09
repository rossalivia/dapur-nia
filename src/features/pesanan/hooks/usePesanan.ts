import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pesanan } from '@/types';

export function usePesanan() {
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'pesanan');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Pesanan[];

        items.sort((a, b) => {
          const getMillis = (t: any) => {
            if (!t) return 0;
            if (typeof t.toMillis === 'function') return t.toMillis();
            if (t.seconds) return t.seconds * 1000;
            return 0;
          };
          return getMillis(b.dibuat_pada) - getMillis(a.dibuat_pada);
        });

        setPesananList(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to pesanan:', err);
        setError('Gagal memuat data pesanan dari server.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { pesananList, loading, error };
}
