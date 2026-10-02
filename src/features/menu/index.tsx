import React, { useState } from 'react';
import { useMenu } from './hooks/useMenu';
import { menuService } from './services/menuService';
import { MenuList } from './components/MenuList';
import { MenuFormSheet } from './components/MenuFormSheet';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Menu } from '@/types';
import { Plus, Utensils } from 'lucide-react';

export const MenuFeature: React.FC = () => {
  const { menus, loading, error } = useMenu();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const handleAddNew = () => {
    setSelectedMenu(null);
    setIsFormOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      try {
        await menuService.deleteMenu(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus menu.');
      }
    }
  };

  const handleSubmit = async (data: Omit<Menu, 'id' | 'dibuat_pada'>) => {
    if (selectedMenu?.id) {
      await menuService.updateMenu(selectedMenu.id, data);
    } else {
      await menuService.addMenu(data);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Menu Harian
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola daftar menu, harga porsi, dan ketersediaan stok
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {loading && <LoadingState message="Memuat daftar menu katering..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <MenuList
          menus={menus}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
      )}

      <MenuFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedMenu}
      />
    </div>
  );
};

export default MenuFeature;
