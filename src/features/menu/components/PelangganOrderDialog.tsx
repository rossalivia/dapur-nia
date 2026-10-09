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
import { ShoppingBag, Loader2, User, Phone, MapPin } from 'lucide-react';

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
  const [jumlahPorsi, setJumlahPorsi] = useState<string>('1');
  const [alamatKirim, setAlamatKirim] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setJumlahPorsi('1');
      setAlamatKirim(profile?.alamat || '');
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!menu) return null;

  const porsiNum = Number(jumlahPorsi) || 0;
  const hargaSatuan = menu.harga || 0;
  const ongkir = 0;
  let total = 0;
  try {
    total = calculateTotal(hargaSatuan, porsiNum, ongkir);
  } catch {
    total = 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profile?.no_whatsapp) {
      setErrorMsg('Data profil pelanggan belum lengkap.');
      return;
    }

    if (!alamatKirim.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi.');
      return;
    }

    try {
      validatePesananPortion(porsiNum, menu.sisa_porsi);
    } catch (err: any) {
      setErrorMsg(err.message);
      return;
    }

    const payload: any = {
      pelanggan_id: profile.no_whatsapp,
      nama_pelanggan: profile.nama,
      alamat_kirim: alamatKirim.trim(),
      menu_id: menu.id!,
      nama_menu: menu.nama,
      harga_satuan: menu.harga,
      jumlah_porsi: porsiNum,
      ongkir: 0,
      total,
      bukti_bayar: '',
      tanggal: getTodayDateString(),
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
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Konfirmasi Pemesanan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Info Menu */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
            <h4 className="font-semibold text-sm text-foreground">{menu.nama}</h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Harga Satuan:</span>
              <span className="font-bold text-primary">{formatRupiah(menu.harga)} / porsi</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
              <span>Sisa Porsi Tersedia:</span>
              <span className="font-medium text-foreground">{menu.sisa_porsi} porsi</span>
            </div>
          </div>

          {/* Jumlah Porsi */}
          <div className="space-y-1.5">
            <Label htmlFor="order-porsi">Jumlah Porsi yang Dipesan</Label>
            <Input
              id="order-porsi"
              type="number"
              min={1}
              max={menu.sisa_porsi}
              value={jumlahPorsi}
              onChange={(e) => setJumlahPorsi(e.target.value)}
              required
            />
          </div>

          {/* Info Pemesan (Auto-filled dari Akun) */}
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Pemesan: {profile?.nama || 'Pelanggan'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>WhatsApp: {profile?.no_whatsapp || '-'}</span>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div className="space-y-1.5">
            <Label htmlFor="order-alamat" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Alamat Pengiriman
            </Label>
            <textarea
              id="order-alamat"
              rows={2}
              value={alamatKirim}
              onChange={(e) => setAlamatKirim(e.target.value)}
              placeholder="Alamat lengkap penerima"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              required
            />
          </div>

          {/* Total Tagihan */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Tagihan:</span>
            <span className="text-base font-bold text-primary">{formatRupiah(total)}</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || menu.sisa_porsi === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Mengirim Pesanan...
                </>
              ) : (
                'Kirim Pesanan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
