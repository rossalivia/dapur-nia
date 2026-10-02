import { Firestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function seedInitialData(db: Firestore): Promise<{ menusCount: number; pelangganCount: number }> {
  const sampleMenus = [
    { nama: 'Nasi Ayam Bakar', harga: 25000, sisa_porsi: 30, tersedia: true },
    { nama: 'Nasi Rendang Padang', harga: 32000, sisa_porsi: 20, tersedia: true },
    { nama: 'Nasi Ikan Gurame Goreng', harga: 28000, sisa_porsi: 15, tersedia: true },
    { nama: 'Paket Sayur Asem & Tempe', harga: 18000, sisa_porsi: 0, tersedia: true }, // Contoh status Habis
  ];

  const samplePelanggan = [
    { nama: 'Budi Santoso', no_whatsapp: '081234567890', alamat: 'Jl. Melati No. 12, RT 03/RW 05' },
    { nama: 'Siti Rahma', no_whatsapp: '081398765432', alamat: 'Komplek Griya Indah Blok C No. 4' },
    { nama: 'Agus Pratama', no_whatsapp: '085712349876', alamat: 'Jl. Danau Toba No. 45' },
  ];

  // Seed Menu
  for (const menu of sampleMenus) {
    const menuRef = doc(collection(db, 'menu'));
    await setDoc(menuRef, {
      ...menu,
      dibuat_pada: serverTimestamp(),
    });
  }

  // Seed Pelanggan (ID dokumen = no_whatsapp)
  for (const pel of samplePelanggan) {
    const pelRef = doc(db, 'pelanggan', pel.no_whatsapp);
    await setDoc(pelRef, {
      ...pel,
      dibuat_pada: serverTimestamp(),
    });
  }

  return {
    menusCount: sampleMenus.length,
    pelangganCount: samplePelanggan.length,
  };
}
