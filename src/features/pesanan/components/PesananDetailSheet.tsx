import React, { useState, useContext } from 'react';
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
import {
  User,
  MapPin,
  Utensils,
  Receipt,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { AuthContext } from '@/features/auth/context/AuthContext';

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

  const authContext = useContext(AuthContext);
  const isPelanggan = authContext?.role === 'pelanggan';

  if (!pesanan) return null;

  const allowedTransitions = getAllowedStatusTransitions(pesanan.status);

  const handleUpdateStatus = async (nextStatus: PesananStatus) => {
    if (!pesanan.id) return;
    setErrorMsg(null);

    const isCancel = nextStatus === 'dibatalkan';
    const confirmMessage = isCancel
      ? 'Yakin ingin membatalkan pesanan ini? Sisa porsi menu akan otomatis dikembalikan ke stok katering.'
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

  // WhatsApp link ke Pelanggan (untuk Admin)
  const waPelangganUrl = pesanan.pelanggan_id.startsWith('0')
    ? `https://wa.me/62${pesanan.pelanggan_id.slice(1)}`
    : `https://wa.me/${pesanan.pelanggan_id}`;

  // WhatsApp link ke Admin (untuk Pelanggan)
  const waAdminMessage = encodeURIComponent(
    `Halo Dapur Nia, saya ingin menanyakan pesanan katering:\n` +
      `• No. Pesanan: ${pesanan.id}\n` +
      `• Menu: ${pesanan.nama_menu} (${pesanan.jumlah_porsi} porsi)\n` +
      `• Status Saat Ini: ${pesanan.status}\n` +
      `Terima kasih!`
  );
  const waAdminUrl = `https://wa.me/6281234567890?text=${waAdminMessage}`;

  // Step tracker definitions
  const steps = [
    { key: 'menunggu_bayar', label: 'Menunggu', icon: Clock },
    { key: 'dibayar', label: 'Dibayar', icon: CheckCircle2 },
    { key: 'diproses', label: 'Dimasak', icon: ChefHat },
    { key: 'selesai', label: 'Selesai', icon: Truck },
  ];

  const currentStepIndex =
    pesanan.status === 'dibatalkan'
      ? -1
      : steps.findIndex((s) => s.key === pesanan.status);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mt-1">
            <DialogTitle className="text-base font-bold text-foreground">
              Detail Transaksi Pesanan
            </DialogTitle>
            {getStatusBadge(pesanan.status)}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            ID: {pesanan.id || '-'} • Jadwal: {pesanan.tanggal}
          </span>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3.5 py-1 text-xs">
          {/* Visual Step Progress Tracker (Jika tidak dibatalkan) */}
          {pesanan.status !== 'dibatalkan' ? (
            <div className="p-3 bg-muted/30 rounded-xl border border-border/70">
              <span className="text-[10px] font-semibold text-muted-foreground block mb-2">
                Alur Proses Katering:
              </span>
              <div className="flex items-center justify-between relative">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 font-bold scale-110 shadow-xs'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={`text-[9px] mt-1 text-center font-medium ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isCompleted
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Pesanan Telah Dibatalkan</p>
                <p className="text-[10px] text-destructive/80">
                  Stok porsi menu telah dikembalikan ke katalog Dapur Nia.
                </p>
              </div>
            </div>
          )}

          {/* Info Pelanggan & Alamat */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border/60">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                {pesanan.nama_pelanggan}
              </span>

              {/* Tombol WhatsApp */}
              {!isPelanggan ? (
                <a
                  href={waPelangganUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1 hover:underline bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800"
                >
                  <MessageCircle className="h-3 w-3" />
                  Chat WA ({pesanan.pelanggan_id})
                </a>
              ) : (
                <span className="text-muted-foreground text-[11px] font-mono">
                  {pesanan.pelanggan_id}
                </span>
              )}
            </div>

            <div className="flex items-start gap-1.5 text-muted-foreground pt-1 border-t border-border/40">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
              <p className="leading-relaxed text-foreground">{pesanan.alamat_kirim}</p>
            </div>
          </div>

          {/* Rincian Menu & Harga */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
              <Utensils className="h-3.5 w-3.5 text-primary" />
              <span>Rincian Hidangan</span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>
                {pesanan.nama_menu} ({pesanan.jumlah_porsi} porsi × {formatRupiah(pesanan.harga_satuan)})
              </span>
              <span className="font-medium text-foreground">
                {formatRupiah(pesanan.harga_satuan * pesanan.jumlah_porsi)}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Ongkos Kirim</span>
              <span className="font-medium text-foreground">
                {pesanan.ongkir > 0 ? formatRupiah(pesanan.ongkir) : 'Gratis'}
              </span>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold text-foreground">
              <span>Total Tagihan:</span>
              <span className="text-primary text-sm font-extrabold">{formatRupiah(pesanan.total)}</span>
            </div>
          </div>

          {/* Bukti Bayar / Catatan */}
          {pesanan.bukti_bayar ? (
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
              <span className="font-medium text-muted-foreground block mb-1">
                Metode / Catatan Pesanan:
              </span>
              <p className="font-medium text-[11px] bg-background p-2 rounded-lg border border-border break-words text-foreground">
                {pesanan.bukti_bayar}
              </p>
            </div>
          ) : null}

          {/* Instruksi Pembayaran Khusus Pelanggan jika Menunggu Bayar */}
          {isPelanggan && pesanan.status === 'menunggu_bayar' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1.5 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                <span>Instruksi Pembayaran:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Silakan transfer ke <strong>BCA 1234567890 a.n Dapur Nia</strong> sebesar{' '}
                <strong>{formatRupiah(pesanan.total)}</strong> atau scan QRIS, lalu kirim bukti transfer ke WhatsApp kami di bawah ini.
              </p>
              <a
                href={waAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Konfirmasi Pembayaran via WhatsApp
              </a>
            </div>
          )}

          {/* Tindakan Status (Hanya untuk Admin / Pengelola) */}
          {!isPelanggan && (
            <div className="space-y-2 pt-1">
              <span className="font-semibold text-muted-foreground block text-xs">
                Perbarui Status Pesanan:
              </span>

              {allowedTransitions.length === 0 ? (
                <p className="text-muted-foreground text-[11px] italic bg-muted/20 p-2 rounded-lg text-center">
                  Pesanan berada pada status akhir ({pesanan.status}). Status terkunci.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.includes('dibayar') && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('dibayar')}
                    >
                      Konfirmasi Dibayar
                    </Button>
                  )}

                  {allowedTransitions.includes('diproses') && (
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('diproses')}
                    >
                      Proses (Dimasak)
                    </Button>
                  )}

                  {allowedTransitions.includes('selesai') && (
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('selesai')}
                    >
                      Selesaikan (Terkirim)
                    </Button>
                  )}

                  {allowedTransitions.includes('dibatalkan') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 border-destructive/40 text-xs h-9"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('dibatalkan')}
                    >
                      Batalkan Pesanan
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isUpdating}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
