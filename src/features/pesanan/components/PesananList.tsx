import React, { useState } from 'react';
import { Pesanan, PesananStatus } from '@/types';
import { PesananCard } from './PesananCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PesananListProps {
  pesananList: Pesanan[];
  onSelectPesanan: (pesanan: Pesanan) => void;
  onAddNew: () => void;
}

export const PesananList: React.FC<PesananListProps> = ({
  pesananList,
  onSelectPesanan,
  onAddNew,
}) => {
  const [activeFilter, setActiveFilter] = useState<'semua' | PesananStatus>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = pesananList.filter((p) => {
    // Status Filter
    if (activeFilter !== 'semua' && p.status !== activeFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCustomer = p.nama_pelanggan.toLowerCase().includes(q);
      const matchPhone = p.pelanggan_id.includes(q);
      const matchMenu = p.nama_menu.toLowerCase().includes(q);
      const matchDate = p.tanggal.includes(q);
      return matchCustomer || matchPhone || matchMenu || matchDate;
    }

    return true;
  });

  const filterTabs: { id: 'semua' | PesananStatus; label: string; count: number }[] = [
    { id: 'semua', label: 'Semua', count: pesananList.length },
    {
      id: 'menunggu_bayar',
      label: 'Menunggu',
      count: pesananList.filter((p) => p.status === 'menunggu_bayar').length,
    },
    {
      id: 'dibayar',
      label: 'Dibayar',
      count: pesananList.filter((p) => p.status === 'dibayar').length,
    },
    {
      id: 'diproses',
      label: 'Dimasak',
      count: pesananList.filter((p) => p.status === 'diproses').length,
    },
    {
      id: 'selesai',
      label: 'Selesai',
      count: pesananList.filter((p) => p.status === 'selesai').length,
    },
    {
      id: 'dibatalkan',
      label: 'Batal',
      count: pesananList.filter((p) => p.status === 'dibatalkan').length,
    },
  ];

  if (pesananList.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Pesanan"
        description="Belum ada pesanan masuk. Buat pesanan baru untuk mulai memproses transaksi katering."
        actionLabel="+ Buat Pesanan"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Cari pesanan (nama, no WA, menu)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs bg-card"
        />
      </div>

      {/* Status Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
              activeFilter === tab.id
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                  : 'bg-background text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-center text-muted-foreground py-8">
          Tidak ada pesanan yang cocok dengan pencarian atau filter '{activeFilter}'.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((pesanan) => (
            <PesananCard
              key={pesanan.id || `${pesanan.pelanggan_id}-${pesanan.tanggal}`}
              pesanan={pesanan}
              onClick={onSelectPesanan}
            />
          ))}
        </div>
      )}
    </div>
  );
};
