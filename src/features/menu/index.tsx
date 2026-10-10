import React, { useState } from 'react';
import { useMenu } from './hooks/useMenu';
import { menuService } from './services/menuService';
import { MenuList } from './components/MenuList';
import { MenuFormSheet } from './components/MenuFormSheet';
import { PelangganOrderDialog } from './components/PelangganOrderDialog';
import { OrderSuccessDialog } from './components/OrderSuccessDialog';
import { pesananService, CreatePesananDTO } from '@/features/pesanan/services/pesananService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Menu } from '@/types';
import {
  Plus,
  Utensils,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const MenuFeature: React.FC = () => {
  const { menus, loading, error } = useMenu();
  const { role, profile, user } = useAuth();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'semua' | 'tersedia' | 'habis'>('semua');

  // Order Success Modal State
  const [successOrder, setSuccessOrder] = useState<{
    id: string;
    nama_menu: string;
    jumlah_porsi: number;
    total: number;
    tanggal: string;
  } | null>(null);

  const isAdmin = role === 'admin';

  const handleAddNew = () => {
    setSelectedMenu(null);
    setIsFormOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus menu ini dari daftar katering?')) {
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

  const handleOrder = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsOrderOpen(true);
  };

  const handleCreatePesanan = async (dto: CreatePesananDTO) => {
    const orderId = await pesananService.createPesanan(dto);
    setIsOrderOpen(false);

    // Buka modal sukses dengan direct WhatsApp button
    setSuccessOrder({
      id: orderId,
      nama_menu: dto.nama_menu,
      jumlah_porsi: dto.jumlah_porsi,
      total: (dto as any).total || dto.harga_satuan * dto.jumlah_porsi,
      tanggal: dto.tanggal || 'Hari Ini',
    });
  };

  // Filter menus based on search & stock
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.nama.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;

    if (stockFilter === 'tersedia') {
      return menu.sisa_porsi > 0 && (isAdmin ? true : menu.tersedia);
    }
    if (stockFilter === 'habis') {
      return menu.sisa_porsi === 0;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Banner Khusus Pelanggan */}
      {!isAdmin && (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
            <Sparkles className="h-4 w-4" />
            <span>Katering Harian Berkualitas</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {profile?.nama ? `Selamat Datang, ${profile.nama}!` : 'Selamat Datang di Dapur Nia!'}
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed mt-0.5">
              Pilihan menu rumahan sedap, higienis, dan porsi pas. Pesan hari ini untuk santap siang atau keluarga.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-emerald-100">
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <ShieldCheck className="h-3 w-3" /> Halal & Bersih
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <Clock className="h-3 w-3" /> Antar Tepat Waktu
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <HeartHandshake className="h-3 w-3" /> Promo Gratis Ongkir
            </span>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Utensils className="h-5 w-5 text-primary" />
            {isAdmin ? 'Kelola Menu Harian' : 'Daftar Menu Katering'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isAdmin
              ? 'Atur ketersediaan menu, sisa porsi, dan harga satuan'
              : 'Pilih hidangan favorit Anda dan pesan dengan mudah'}
          </p>
        </div>

        {/* Tombol Tambah Menu untuk Admin */}
        {isAdmin && (
          <Button onClick={handleAddNew} size="sm" className="gap-1.5 shadow-sm font-semibold">
            <Plus className="h-4 w-4" />
            Tambah Menu
          </Button>
        )}
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama hidangan katering..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-muted-foreground mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setStockFilter('semua')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              stockFilter === 'semua'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            Semua ({menus.length})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('tersedia')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              stockFilter === 'tersedia'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            Tersedia ({menus.filter((m) => m.sisa_porsi > 0 && (isAdmin ? true : m.tersedia)).length})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('habis')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              stockFilter === 'habis'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            Habis ({menus.filter((m) => m.sisa_porsi === 0).length})
          </button>
        </div>
      </div>

      {loading && <LoadingState message="Memuat daftar menu katering..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <MenuList
          menus={filteredMenus}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          onAddNew={isAdmin ? handleAddNew : undefined}
          onOrder={handleOrder}
          role={role}
        />
      )}

      {/* Sheet untuk Admin Menambah/Mengubah Menu */}
      {isAdmin && (
        <MenuFormSheet
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedMenu}
        />
      )}

      {/* Dialog Pemesanan Khusus Pelanggan */}
      {!isAdmin && (
        <PelangganOrderDialog
          isOpen={isOrderOpen}
          onClose={() => setIsOrderOpen(false)}
          onSubmit={handleCreatePesanan}
          menu={selectedMenu}
          profile={profile}
          userEmail={user?.email}
          userId={user?.uid}
        />
      )}

      {/* Dialog Konfirmasi Sukses dengan WhatsApp Link */}
      <OrderSuccessDialog
        isOpen={Boolean(successOrder)}
        onClose={() => setSuccessOrder(null)}
        onViewOrders={() => {
          setSuccessOrder(null);
          navigate('/pesanan-saya');
        }}
        orderDetails={successOrder}
      />
    </div>
  );
};

export default MenuFeature;
