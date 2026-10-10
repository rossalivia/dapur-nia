import React, { useState } from 'react';
import { usePesanan } from '../hooks/usePesanan';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PesananCard } from './PesananCard';
import { PesananDetailSheet } from './PesananDetailSheet';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pesanan } from '@/types';
import { ShoppingBag, MessageCircle, HelpCircle } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pesanan Saya
          </h1>
          <p className="text-xs text-muted-foreground">
            {profile?.nama
              ? `Riwayat pesanan katering atas nama ${profile.nama}`
              : 'Pantau status hidangan katering & konfirmasi pembayaran Anda'}
          </p>
        </div>
        {myPesanan.length > 0 && (
          <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
            {myPesanan.length} Pesanan
          </span>
        )}
      </div>

      {loading && <LoadingState message="Memuat riwayat pesanan Anda..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && myPesanan.length === 0 && (
        <EmptyState
          title="Belum Ada Pesanan"
          description="Anda belum memiliki riwayat pesanan katering. Yuk, pilih menu lezat hari ini!"
          actionLabel="Lihat Menu Katering"
          onAction={() => navigate('/menu')}
        />
      )}

      {!loading && !error && myPesanan.length > 0 && (
        <div className="space-y-3">
          {myPesanan.map((pesanan) => (
            <PesananCard
              key={pesanan.id || `${pesanan.pelanggan_id}-${pesanan.tanggal}`}
              pesanan={pesanan}
              onClick={(p) => setSelectedPesanan(p)}
            />
          ))}

          {/* Kartu Bantuan Customer Service */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border/70 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              <span>Ada pertanyaan seputar pesanan Anda?</span>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Dapur%20Nia,%20saya%20ingin%20bertanya%20seputar%20pesanan%20katering"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 text-xs"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Tanya CS WA
            </a>
          </div>
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
