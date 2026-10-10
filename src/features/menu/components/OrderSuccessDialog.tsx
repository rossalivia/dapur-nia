import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
  orderDetails: {
    id: string;
    nama_menu: string;
    jumlah_porsi: number;
    total: number;
    tanggal: string;
  } | null;
}

export const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  isOpen,
  onClose,
  onViewOrders,
  orderDetails,
}) => {
  if (!orderDetails) return null;

  // WhatsApp Admin Dapur Nia link
  const waMessage = encodeURIComponent(
    `Halo Admin Dapur Nia, saya baru saja membuat pesanan katering:\n` +
      `• No. Pesanan: ${orderDetails.id}\n` +
      `• Menu: ${orderDetails.nama_menu} (${orderDetails.jumlah_porsi} porsi)\n` +
      `• Tanggal Antar: ${orderDetails.tanggal}\n` +
      `• Total: ${formatRupiah(orderDetails.total)}\n\n` +
      `Mohon konfirmasi pesanan saya. Terima kasih!`
  );

  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full text-center py-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-bold text-foreground">
            Pesanan Berhasil Dibuat!
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Pesanan Anda telah diterima oleh Dapur Nia dan akan segera diproses.
          </p>
        </DialogHeader>

        <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 my-3 text-left space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Nomor Pesanan</span>
            <span className="font-mono font-medium text-foreground text-[11px] truncate max-w-[160px]">
              {orderDetails.id}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Menu & Porsi</span>
            <span className="font-semibold text-foreground">
              {orderDetails.nama_menu} × {orderDetails.jumlah_porsi}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Tanggal Pengiriman</span>
            <span className="font-medium text-foreground">{orderDetails.tanggal}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center font-bold">
            <span className="text-foreground">Total Pembayaran</span>
            <span className="text-primary text-sm font-extrabold">
              {formatRupiah(orderDetails.total)}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Konfirmasi via WhatsApp Dapur Nia
          </a>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-xs"
            onClick={onViewOrders}
          >
            <ShoppingBag className="h-4 w-4" />
            Lihat di "Pesanan Saya"
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
