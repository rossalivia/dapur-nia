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
import { calculateTotal, validatePesananPortion, CreatePesananDTO } from '@/features/pesanan/services/pesananService';
import {
  ShoppingBag,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  Plus,
  Minus,
  FileText,
  Truck,
} from 'lucide-react';

interface PelangganOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu | null;
  profile: Pelanggan | null;
  userEmail?: string | null;
  userId?: string | null;
  onSubmit: (dto: CreatePesananDTO & { email_pelanggan?: string; user_id?: string }) => Promise<void>;
}

export const PelangganOrderDialog: React.FC<PelangganOrderDialogProps> = ({
  isOpen,
  onClose,
  menu,
  profile,
  userEmail,
  userId,
  onSubmit,
}) => {
  const [jumlahPorsi, setJumlahPorsi] = useState<number>(1);
  const [alamatKirim, setAlamatKirim] = useState('');
  const [tanggalKirim, setTanggalKirim] = useState<string>(getTodayDateString());
  const [catatan, setCatatan] = useState('');
  const [metodeBayar, setMetodeBayar] = useState<'qris' | 'cod'>('qris');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tanggal besok
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  const todayString = getTodayDateString();

  useEffect(() => {
    if (isOpen) {
      setJumlahPorsi(1);
      setAlamatKirim(profile?.alamat || '');
      setTanggalKirim(getTodayDateString());
      setCatatan('');
      setMetodeBayar('qris');
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!menu) return null;

  const hargaSatuan = menu.harga || 0;
  const ongkir = 0; // Promo Gratis Ongkir
  let total = 0;
  try {
    total = calculateTotal(hargaSatuan, jumlahPorsi, ongkir);
  } catch {
    total = 0;
  }

  const handleIncrement = () => {
    if (jumlahPorsi < menu.sisa_porsi) {
      setJumlahPorsi((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (jumlahPorsi > 1) {
      setJumlahPorsi((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profile?.no_whatsapp) {
      setErrorMsg('Data profil nomor WhatsApp belum lengkap.');
      return;
    }

    if (!alamatKirim.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi.');
      return;
    }

    try {
      validatePesananPortion(jumlahPorsi, menu.sisa_porsi);
    } catch (err: any) {
      setErrorMsg(err.message);
      return;
    }

    const paymentNote =
      metodeBayar === 'qris'
        ? `Transfer / QRIS${catatan ? ` • Catatan: ${catatan.trim()}` : ''}`
        : `COD (Bayar Tunai di Tempat)${catatan ? ` • Catatan: ${catatan.trim()}` : ''}`;

    const payload: any = {
      pelanggan_id: profile.no_whatsapp,
      nama_pelanggan: profile.nama,
      alamat_kirim: alamatKirim.trim(),
      menu_id: menu.id!,
      nama_menu: menu.nama,
      harga_satuan: menu.harga,
      jumlah_porsi: jumlahPorsi,
      ongkir: 0,
      total,
      bukti_bayar: paymentNote,
      tanggal: tanggalKirim,
      email_pelanggan: userEmail || (profile as any)?.email || '',
      user_id: userId || '',
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pesan Menu Katering
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Info Menu Ringkas */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/70 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-foreground">{menu.nama}</h4>
              <p className="text-xs text-primary font-semibold mt-0.5">
                {formatRupiah(menu.harga)} <span className="text-muted-foreground font-normal">/ porsi</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Tersedia</span>
              <span className="font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {menu.sisa_porsi} porsi
              </span>
            </div>
          </div>

          {/* Pemilihan Tanggal Pengiriman */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Jadwal Pengiriman
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTanggalKirim(todayString)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                  tanggalKirim === todayString
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                Hari Ini
                <span className="block text-[10px] font-normal opacity-80">{todayString}</span>
              </button>

              <button
                type="button"
                onClick={() => setTanggalKirim(tomorrowString)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                  tanggalKirim === tomorrowString
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                Besok
                <span className="block text-[10px] font-normal opacity-80">{tomorrowString}</span>
              </button>
            </div>
          </div>

          {/* Jumlah Porsi Stepper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Jumlah Porsi</Label>
              <span className="text-[10px] text-muted-foreground">Maksimal {menu.sisa_porsi} porsi</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={jumlahPorsi <= 1}
                className="h-9 w-9 rounded-lg"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center font-bold text-base py-1.5 bg-muted/30 rounded-lg border border-border/60">
                {jumlahPorsi} porsi
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={jumlahPorsi >= menu.sisa_porsi}
                className="h-9 w-9 rounded-lg"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="order-alamat" className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Alamat Pengantaran
              </Label>
              <span className="text-[10px] text-muted-foreground">Penerima: {profile?.nama || 'Pelanggan'}</span>
            </div>
            <textarea
              id="order-alamat"
              rows={2}
              value={alamatKirim}
              onChange={(e) => setAlamatKirim(e.target.value)}
              placeholder="Tulis alamat lengkap (jalan, nomor rumah, RT/RW, patokan)..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              required
            />
          </div>

          {/* Catatan Masakan / Pengiriman */}
          <div className="space-y-1.5">
            <Label htmlFor="order-catatan" className="flex items-center gap-1.5 text-xs font-semibold">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Catatan Pesanan (Opsional)
            </Label>
            <Input
              id="order-catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Sambal dipisah, antar jam 11:30 siang"
              className="text-xs h-8"
              maxLength={100}
            />
          </div>

          {/* Metode Pembayaran */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Metode Pembayaran
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  metodeBayar === 'qris'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="metodeBayar"
                  checked={metodeBayar === 'qris'}
                  onChange={() => setMetodeBayar('qris')}
                  className="sr-only"
                />
                <CreditCard className="h-4 w-4 shrink-0" />
                <div>
                  <span className="block text-xs">QRIS / Transfer</span>
                  <span className="block text-[9px] font-normal opacity-80">BCA / Mandiri / GoPay</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  metodeBayar === 'cod'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="metodeBayar"
                  checked={metodeBayar === 'cod'}
                  onChange={() => setMetodeBayar('cod')}
                  className="sr-only"
                />
                <Banknote className="h-4 w-4 shrink-0" />
                <div>
                  <span className="block text-xs">Bayar Tunai</span>
                  <span className="block text-[9px] font-normal opacity-80">COD saat diterima</span>
                </div>
              </label>
            </div>
          </div>

          {/* Rincian Harga & Promo Ongkir */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/70 space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal ({jumlahPorsi} porsi)</span>
              <span>{formatRupiah(hargaSatuan * jumlahPorsi)}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-emerald-600" />
                Ongkos Kirim
              </span>
              <span className="font-semibold text-emerald-600">GRATIS (Promo)</span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between font-bold text-sm text-foreground">
              <span>Total Pembayaran:</span>
              <span className="text-base text-primary font-extrabold">{formatRupiah(total)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || menu.sisa_porsi === 0}
              className="gap-1.5 shadow-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengirim Pesanan...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Konfirmasi & Pesan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
