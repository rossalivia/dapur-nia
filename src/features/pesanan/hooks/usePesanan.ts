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
    const q = query(collection(db, 'pesanan'), orderBy('dibuat_pada', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Pesanan[];
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
