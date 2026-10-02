import React, { useState } from 'react';
import { Pelanggan } from '@/types';
import { PelangganCard } from './PelangganCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PelangganListProps {
  pelangganList: Pelanggan[];
  onEdit: (pelanggan: Pelanggan) => void;
  onDelete: (no_whatsapp: string) => void;
  onAddNew: () => void;
}

export const PelangganList: React.FC<PelangganListProps> = ({
  pelangganList,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = pelangganList.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nama.toLowerCase().includes(term) ||
      p.no_whatsapp.includes(term) ||
      p.alamat.toLowerCase().includes(term)
    );
  });

  if (pelangganList.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Pelanggan"
        description="Data pelanggan katering masih kosong. Daftarkan pelanggan pertama Anda sekarang."
        actionLabel="+ Tambah Pelanggan"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau nomor WhatsApp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-center text-muted-foreground py-6">
          Tidak ditemukan pelanggan dengan kata kunci "{searchTerm}".
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((pel) => (
            <PelangganCard
              key={pel.no_whatsapp}
              pelanggan={pel}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
