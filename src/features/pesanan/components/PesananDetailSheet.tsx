import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pesanan, PesananStatus } from '@/types';
import { formatRupiah } from '@/lib/formatters';
import { getStatusBadge } from './PesananCard';
import { pesananService, getAllowedStatusTransitions } from '../services/pesananService';
import { User, MapPin, Utensils, Receipt, MessageCircle, AlertTriangle } from 'lucide-react';

interface PesananDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pesanan: Pesanan | null;
  onStatusChanged?: () => void;
}

export const PesananDetailSheet: React.FC<PesananDetailSheetProps> = ({
  isOpen,
  onClose,
  pesanan,
  onStatusChanged,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!pesanan) return null;

  const allowedTransitions = getAllowedStatusTransitions(pesanan.status);

  const handleUpdateStatus = async (nextStatus: PesananStatus) => {
    if (!pesanan.id) return;
    setErrorMsg(null);

    const isCancel = nextStatus === 'dibatalkan';
    const confirmMessage = isCancel
      ? 'Yakin ingin membatalkan pesanan ini? Stok porsi menu akan otomatis dikembalikan.'
      : `Ubah status pesanan ke '${nextStatus}'?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsUpdating(true);
      await pesananService.updateStatus(
        pesanan.id,
        pesanan.status,
        nextStatus,
        pesanan.menu_id,
        pesanan.jumlah_porsi
      );
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setIsUpdating(false);
    }
  };

  const waUrl = pesanan.pelanggan_id.startsWith('0')
    ? `https://wa.me/62${pesanan.pelanggan_id.slice(1)}`
    : `https://wa.me/${pesanan.pelanggan_id}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mt-1">
            <DialogTitle className="text-lg">Detail Pesanan</DialogTitle>
            {getStatusBadge(pesanan.status)}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            ID: {pesanan.id || '-'} • Tanggal: {pesanan.tanggal}
          </span>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 py-2 text-xs">
          {/* Customer info */}
          <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border border-border/60">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {pesanan.nama_pelanggan}
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {pesanan.pelanggan_id}
              </a>
            </div>
            <div className="flex items-start gap-1.5 text-muted-foreground pt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p>{pesanan.alamat_kirim}</p>
            </div>
          </div>

          {/* Menu & Pricing info */}
          <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
              <Utensils className="h-4 w-4 text-primary" />
              <span>Rincian Pesanan</span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>{pesanan.nama_menu} ({pesanan.jumlah_porsi} porsi × {formatRupiah(pesanan.harga_satuan)})</span>
              <span className="font-medium text-foreground">
                {formatRupiah(pesanan.harga_satuan * pesanan.jumlah_porsi)}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Ongkos Kirim</span>
              <span className="font-medium text-foreground">{formatRupiah(pesanan.ongkir)}</span>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-foreground">
              <span>Total Tagihan</span>
              <span className="text-primary text-base">{formatRupiah(pesanan.total)}</span>
            </div>
          </div>

          {/* Payment proof / note */}
          {pesanan.bukti_bayar ? (
            <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
              <span className="font-medium text-muted-foreground block mb-1">Catatan / Bukti Bayar:</span>
              <p className="font-mono text-[11px] bg-background p-2 rounded border border-border break-all">
                {pesanan.bukti_bayar}
              </p>
            </div>
          ) : null}

          {/* Status lifecycle actions */}
          <div className="space-y-2 pt-2">
            <span className="font-semibold text-muted-foreground block">
              Tindakan Status:
            </span>

            {allowedTransitions.length === 0 ? (
              <p className="text-muted-foreground text-[11px] italic bg-muted/20 p-2 rounded text-center">
                Pesanan berada pada status akhir ({pesanan.status}). Status terkunci dan tidak dapat diubah lagi.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allowedTransitions.includes('dibayar') && (
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('dibayar')}
                  >
                    Konfirmasi Dibayar
                  </Button>
                )}

                {allowedTransitions.includes('diproses') && (
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('diproses')}
                  >
                    Proses Pesanan
                  </Button>
                )}

                {allowedTransitions.includes('selesai') && (
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('selesai')}
                  >
                    Selesaikan Pesanan
                  </Button>
                )}

                {allowedTransitions.includes('dibatalkan') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 border-destructive/40"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('dibatalkan')}
                  >
                    Batalkan Pesanan
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
