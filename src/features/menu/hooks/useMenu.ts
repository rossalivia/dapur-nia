import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Menu } from '@/types';

export function useMenu() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'menu');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Menu[];

        items.sort((a, b) => {
          const getMillis = (t: any) => {
            if (!t) return 0;
            if (typeof t.toMillis === 'function') return t.toMillis();
            if (t.seconds) return t.seconds * 1000;
            return 0;
          };
          return getMillis(b.dibuat_pada) - getMillis(a.dibuat_pada);
        });

        setMenus(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to menu:', err);
        setError('Gagal memuat data menu dari server.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { menus, loading, error };
}
