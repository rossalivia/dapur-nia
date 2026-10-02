import React, { useState } from 'react';
import { Pesanan, PesananStatus } from '@/types';
import { PesananCard } from './PesananCard';
import { EmptyState } from '@/components/shared/EmptyState';

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

  const filtered = pesananList.filter((p) => {
    if (activeFilter === 'semua') return true;
    return p.status === activeFilter;
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
      label: 'Diproses',
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
      {/* Status Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 text-xs ${
              activeFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
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
          Tidak ada pesanan dengan status '{activeFilter}'.
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
