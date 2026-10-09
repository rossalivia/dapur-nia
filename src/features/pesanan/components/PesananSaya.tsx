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
      return p.email_pelanggan.toLowerCase() === user.email.toLowerCase();
    }
    // 2. Cek kecocokan user ID auth jika tersimpan
    if (user?.uid && p.user_id) {
      return p.user_id === user.uid;
    }
    // 3. Cek kecocokan nomor WhatsApp DAN nama pelanggan
    if (profile?.no_whatsapp && p.pelanggan_id === profile.no_whatsapp) {
      if (profile.nama && p.nama_pelanggan) {
        return p.nama_pelanggan.toLowerCase().trim() === profile.nama.toLowerCase().trim();
      }
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
