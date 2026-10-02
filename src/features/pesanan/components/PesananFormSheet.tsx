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
import { Menu, Pelanggan } from '@/types';
import { formatRupiah, getTodayDateString } from '@/lib/formatters';
import { calculateTotal, validatePesananPortion, CreatePesananDTO } from '../services/pesananService';

interface PesananFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreatePesananDTO) => Promise<void>;
  menus: Menu[];
  pelangganList: Pelanggan[];
}

export const PesananFormSheet: React.FC<PesananFormSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  menus,
  pelangganList,
}) => {
  const [selectedPelangganId, setSelectedPelangganId] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [jumlahPorsi, setJumlahPorsi] = useState<string>('1');
  const [ongkir, setOngkir] = useState<string>('0');
  const [buktiBayar, setBuktiBayar] = useState('');
  const [tanggal, setTanggal] = useState(getTodayDateString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available menus with sisa_porsi > 0
  const availableMenus = menus.filter((m) => m.tersedia && m.sisa_porsi > 0);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);
  const selectedPelanggan = pelangganList.find((p) => p.no_whatsapp === selectedPelangganId);

  useEffect(() => {
    if (isOpen) {
      setSelectedPelangganId(pelangganList[0]?.no_whatsapp || '');
      setSelectedMenuId(availableMenus[0]?.id || '');
      setJumlahPorsi('1');
      setOngkir('0');
      setBuktiBayar('');
      setTanggal(getTodayDateString());
      setErrorMsg(null);
    }
  }, [isOpen]);

  const porsiNum = Number(jumlahPorsi) || 0;
  const ongkirNum = Number(ongkir) || 0;
  const hargaSatuan = selectedMenu?.harga || 0;

  let computedTotal = 0;
  try {
    computedTotal = calculateTotal(hargaSatuan, porsiNum, ongkirNum);
  } catch {
    computedTotal = 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedPelanggan) {
      setErrorMsg('Pilih pelanggan terlebih dahulu. Jika belum ada pelanggan, daftarkan di tab Pelanggan.');
      return;
    }

    if (!selectedMenu || !selectedMenu.id) {
      setErrorMsg('Pilih menu yang dipesan.');
      return;
    }

    try {
      validatePesananPortion(porsiNum, selectedMenu.sisa_porsi);
      calculateTotal(hargaSatuan, porsiNum, ongkirNum);
    } catch (err: any) {
      setErrorMsg(err.message);
      return;
    }

    const payload: CreatePesananDTO = {
      pelanggan_id: selectedPelanggan.no_whatsapp,
      nama_pelanggan: selectedPelanggan.nama,
      alamat_kirim: selectedPelanggan.alamat,
      menu_id: selectedMenu.id,
      nama_menu: selectedMenu.nama,
      harga_satuan: selectedMenu.harga,
      jumlah_porsi: porsiNum,
      ongkir: ongkirNum,
      bukti_bayar: buktiBayar.trim(),
      tanggal,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Select Customer */}
          <div className="space-y-1.5">
            <Label htmlFor="pesanan-pelanggan">Pilih Pelanggan</Label>
            {pelangganList.length === 0 ? (
              <p className="text-xs text-destructive">
                Belum ada data pelanggan. Silakan tambah pelanggan terlebih dahulu di modul Pelanggan.
              </p>
            ) : (
              <select
                id="pesanan-pelanggan"
                value={selectedPelangganId}
                onChange={(e) => setSelectedPelangganId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                {pelangganList.map((p) => (
                  <option key={p.no_whatsapp} value={p.no_whatsapp}>
                    {p.nama} ({p.no_whatsapp})
                  </option>
                ))}
              </select>
            )}
            {selectedPelanggan && (
              <p className="text-[11px] text-muted-foreground truncate">
                Alamat: {selectedPelanggan.alamat}
              </p>
            )}
          </div>

          {/* Select Menu */}
          <div className="space-y-1.5">
            <Label htmlFor="pesanan-menu">Pilih Menu Harian</Label>
            {availableMenus.length === 0 ? (
              <p className="text-xs text-destructive">
                Tidak ada menu dengan porsi tersedia. Silakan update stok menu di tab Menu.
              </p>
            ) : (
              <select
                id="pesanan-menu"
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                {availableMenus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} — {formatRupiah(m.harga)} (Sisa: {m.sisa_porsi} porsi)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Portions & Shipping Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pesanan-porsi">
                Jumlah Porsi {selectedMenu && `(Maks: ${selectedMenu.sisa_porsi})`}
              </Label>
              <Input
                id="pesanan-porsi"
                type="number"
                min="1"
                max={selectedMenu?.sisa_porsi ?? 1}
                value={jumlahPorsi}
                onChange={(e) => setJumlahPorsi(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pesanan-ongkir">Ongkos Kirim (Rp)</Label>
              <Input
                id="pesanan-ongkir"
                type="number"
                min="0"
                step="1000"
                value={ongkir}
                onChange={(e) => setOngkir(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Order Date */}
          <div className="space-y-1.5">
            <Label htmlFor="pesanan-tanggal">Tanggal Pesanan</Label>
            <Input
              id="pesanan-tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          {/* Payment proof / note */}
          <div className="space-y-1.5">
            <Label htmlFor="pesanan-bukti">Catatan / Bukti Transfer (Opsional)</Label>
            <Input
              id="pesanan-bukti"
              placeholder="Contoh: Transfer BCA a.n Budi / https://..."
              value={buktiBayar}
              onChange={(e) => setBuktiBayar(e.target.value)}
            />
          </div>

          {/* Live Calculation Box */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal Menu:</span>
              <span>{formatRupiah(hargaSatuan * porsiNum)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkir:</span>
              <span>{formatRupiah(ongkirNum)}</span>
            </div>
            <div className="pt-1 border-t border-primary/20 flex justify-between font-bold text-sm text-foreground">
              <span>Total Tagihan:</span>
              <span className="text-primary">{formatRupiah(computedTotal)}</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || availableMenus.length === 0 || pelangganList.length === 0}
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Pesanan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
