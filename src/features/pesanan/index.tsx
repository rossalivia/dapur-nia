import React, { useState } from 'react';
import { usePesanan } from './hooks/usePesanan';
import { useMenu } from '@/features/menu/hooks/useMenu';
import { usePelanggan } from '@/features/pelanggan/hooks/usePelanggan';
import { pesananService, CreatePesananDTO } from './services/pesananService';
import { PesananList } from './components/PesananList';
import { PesananFormSheet } from './components/PesananFormSheet';
import { PesananDetailSheet } from './components/PesananDetailSheet';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pesanan } from '@/types';
import { Plus, ShoppingBag } from 'lucide-react';

export const PesananFeature: React.FC = () => {
  const { pesananList, loading, error } = usePesanan();
  const { menus } = useMenu();
  const { pelangganList } = usePelanggan();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);

  const handleAddNew = () => {
    setIsFormOpen(true);
  };

  const handleSelectPesanan = (pesanan: Pesanan) => {
    setSelectedPesanan(pesanan);
  };

  const handleCreatePesanan = async (dto: CreatePesananDTO) => {
    await pesananService.createPesanan(dto);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Daftar Pesanan
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola pesanan katering, verifikasi pembayaran, & perbarui status
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          Pesanan
        </Button>
      </div>

      {loading && <LoadingState message="Memuat daftar pesanan katering..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <PesananList
          pesananList={pesananList}
          onSelectPesanan={handleSelectPesanan}
          onAddNew={handleAddNew}
        />
      )}

      <PesananFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreatePesanan}
        menus={menus}
        pelangganList={pelangganList}
      />

      <PesananDetailSheet
        isOpen={Boolean(selectedPesanan)}
        onClose={() => setSelectedPesanan(null)}
        pesanan={selectedPesanan}
      />
    </div>
  );
};

export default PesananFeature;
