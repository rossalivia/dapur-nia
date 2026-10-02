import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu } from '@/types';
import { validateMenuInput } from '../services/menuService';

interface MenuFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Menu, 'id' | 'dibuat_pada'>) => Promise<void>;
  initialData?: Menu | null;
}

export const MenuFormSheet: React.FC<MenuFormSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState<string>('');
  const [sisaPorsi, setSisaPorsi] = useState<string>('');
  const [tersedia, setTersedia] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || '');
      setHarga(String(initialData.harga ?? ''));
      setSisaPorsi(String(initialData.sisa_porsi ?? ''));
      setTersedia(initialData.tersedia ?? true);
    } else {
      setNama('');
      setHarga('');
      setSisaPorsi('');
      setTersedia(true);
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericHarga = Number(harga);
    const numericPorsi = Number(sisaPorsi);

    const payload = {
      nama,
      harga: numericHarga,
      sisa_porsi: numericPorsi,
      tersedia,
    };

    try {
      validateMenuInput(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'Data menu tidak valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan menu ke Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Ubah Menu' : 'Tambah Menu Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="menu-nama">Nama Menu</Label>
            <Input
              id="menu-nama"
              placeholder="Contoh: Nasi Ayam Bakar Madu"
              value={nama}
              maxLength={60}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {nama.length}/60 karakter
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="menu-harga">Harga (Rp)</Label>
              <Input
                id="menu-harga"
                type="number"
                min="0"
                step="1"
                placeholder="25000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="menu-porsi">Sisa Porsi</Label>
              <Input
                id="menu-porsi"
                type="number"
                min="0"
                step="1"
                placeholder="30"
                value={sisaPorsi}
                onChange={(e) => setSisaPorsi(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="menu-tersedia"
              checked={tersedia}
              onChange={(e) => setTersedia(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="menu-tersedia" className="text-xs cursor-pointer">
              Tampilkan menu di katalog pemesanan
            </Label>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Menu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
