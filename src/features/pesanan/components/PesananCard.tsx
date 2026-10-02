import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pesanan, PesananStatus } from '@/types';
import { formatRupiah } from '@/lib/formatters';
import { Clock, CheckCircle2, ChefHat, Truck, XCircle, ChevronRight } from 'lucide-react';

interface PesananCardProps {
  pesanan: Pesanan;
  onClick: (pesanan: Pesanan) => void;
}

export function getStatusBadge(status: PesananStatus) {
  switch (status) {
    case 'menunggu_bayar':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 text-[10px] gap-1 py-0.5">
          <Clock className="h-3 w-3" />
          Menunggu Bayar
        </Badge>
      );
    case 'dibayar':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 text-[10px] gap-1 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          Dibayar
        </Badge>
      );
    case 'diproses':
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 text-[10px] gap-1 py-0.5">
          <ChefHat className="h-3 w-3" />
          Diproses
        </Badge>
      );
    case 'selesai':
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] gap-1 py-0.5">
          <Truck className="h-3 w-3" />
          Selesai
        </Badge>
      );
    case 'dibatalkan':
      return (
        <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10 text-[10px] gap-1 py-0.5">
          <XCircle className="h-3 w-3" />
          Dibatalkan
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export const PesananCard: React.FC<PesananCardProps> = ({ pesanan, onClick }) => {
  return (
    <Card
      onClick={() => onClick(pesanan)}
      className="cursor-pointer overflow-hidden shadow-sm bg-card hover:border-primary/50 transition-all active:scale-[0.99]"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground block">
              {pesanan.tanggal} • {pesanan.pelanggan_id}
            </span>
            <h3 className="font-semibold text-base text-foreground mt-0.5">
              {pesanan.nama_pelanggan}
            </h3>
          </div>
          {getStatusBadge(pesanan.status)}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div>
            <p className="text-xs font-medium text-foreground">
              {pesanan.nama_menu} <span className="text-muted-foreground font-normal">× {pesanan.jumlah_porsi}</span>
            </p>
            {pesanan.ongkir > 0 && (
              <span className="text-[10px] text-muted-foreground block">
                + ongkir {formatRupiah(pesanan.ongkir)}
              </span>
            )}
          </div>
          <div className="text-right flex items-center gap-1.5">
            <span className="text-sm font-bold text-primary">
              {formatRupiah(pesanan.total)}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
