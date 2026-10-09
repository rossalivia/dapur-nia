import React, { useState } from 'react';
import { usePesanan } from '../hooks/usePesanan';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PesananCard } from './PesananCard';
import { PesananDetailSheet } from './PesananDetailSheet';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pesanan } from '@/types';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PesananSaya: React.FC = () => {
  const { pesananList, loading, error } = usePesanan();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);

  // Filter pesanan khusus pelanggan yang sedang login (keamanan & privasi)
  const myPesanan = pesananList.filter((p: any) => {
    // 1. Cek kecocokan email jika tersimpan di dokumen pesanan
    if (user?.email && p.email_pelanggan) {
      if (p.email_pelanggan.toLowerCase() === user.email.toLowerCase()) return true;
    }
    // 2. Cek kecocokan user ID auth jika tersimpan
    if (user?.uid && p.user_id) {
      if (p.user_id === user.uid) return true;
    }
    // 3. Cek kecocokan nomor WhatsApp
    if (profile?.no_whatsapp && p.pelanggan_id === profile.no_whatsapp) {
      return true;
    }
    // 4. Cek kecocokan nama pelanggan (misal: "rossalivia" untuk user rossalivia111@gmail.com)
    const profileName = (profile?.nama || '').toLowerCase().trim();
    const orderName = (p.nama_pelanggan || '').toLowerCase().trim();
    const userEmailPrefix = (user?.email || '').split('@')[0].toLowerCase().trim();
    const displayName = (user?.displayName || '').toLowerCase().trim();

    if (
      orderName &&
      ((profileName && orderName === profileName) ||
        (displayName && orderName === displayName) ||
        (userEmailPrefix &&
          (orderName.includes(userEmailPrefix) || userEmailPrefix.includes(orderName))))
    ) {
      return true;
    }
    return false;
  });

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Pesanan Saya
        </h1>
        <p className="text-xs text-muted-foreground">
          {profile?.nama
            ? `Riwayat pesanan katering atas nama ${profile.nama}`
            : 'Pantau status pesanan dan konfirmasi pembayaran Anda'}
        </p>
      </div>

      {loading && <LoadingState message="Memuat riwayat pesanan Anda..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && myPesanan.length === 0 && (
        <EmptyState
          title="Belum Ada Pesanan"
          description="Anda belum memiliki pesanan katering. Yuk, pilih menu lezat hari ini!"
          actionLabel="Lihat Menu Katering"
          onAction={() => navigate('/menu')}
        />
      )}

      {!loading && !error && myPesanan.length > 0 && (
        <div className="space-y-3">
          {myPesanan.map((pesanan) => (
            <PesananCard
              key={pesanan.id}
              pesanan={pesanan}
              onClick={(p) => setSelectedPesanan(p)}
            />
          ))}
        </div>
      )}

      <PesananDetailSheet
        isOpen={Boolean(selectedPesanan)}
        onClose={() => setSelectedPesanan(null)}
        pesanan={selectedPesanan}
      />
    </div>
  );
};

export default PesananSaya;
