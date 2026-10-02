import React, { useState } from 'react';
import { usePelanggan } from './hooks/usePelanggan';
import { pelangganService } from './services/pelangganService';
import { PelangganList } from './components/PelangganList';
import { PelangganFormSheet } from './components/PelangganFormSheet';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pelanggan } from '@/types';
import { Plus, Users } from 'lucide-react';

export const PelangganFeature: React.FC = () => {
  const { pelangganList, loading, error } = usePelanggan();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState<Pelanggan | null>(null);

  const handleAddNew = () => {
    setSelectedPelanggan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pel: Pelanggan) => {
    setSelectedPelanggan(pel);
    setIsFormOpen(true);
  };

  const handleDelete = async (no_whatsapp: string) => {
    if (window.confirm(`Yakin ingin menghapus pelanggan ${no_whatsapp}?`)) {
      try {
        await pelangganService.deletePelanggan(no_whatsapp);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus data pelanggan.');
      }
    }
  };

  const handleSubmit = async (data: { nama: string; no_whatsapp: string; alamat: string }) => {
    if (selectedPelanggan) {
      await pelangganService.updatePelanggan(selectedPelanggan.no_whatsapp, {
        nama: data.nama,
        alamat: data.alamat,
      });
    } else {
      await pelangganService.addPelanggan(data);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Data Pelanggan
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola kontak WhatsApp dan alamat pengiriman katering
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {loading && <LoadingState message="Memuat data pelanggan..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <PelangganList
          pelangganList={pelangganList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
      )}

      <PelangganFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedPelanggan}
      />
    </div>
  );
};

export default PelangganFeature;
