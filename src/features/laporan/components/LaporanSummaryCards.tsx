import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { Utensils, DollarSign, ReceiptCheck } from 'lucide-react';

interface LaporanSummaryCardsProps {
  totalPorsiTerjual: number;
  totalUangMasuk: number;
  totalPesanan: number;
}

export const LaporanSummaryCards: React.FC<LaporanSummaryCardsProps> = ({
  totalPorsiTerjual,
  totalUangMasuk,
  totalPesanan,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-card shadow-sm border border-border/80 col-span-2 sm:col-span-1">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Total Uang Masuk
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight">
              {formatRupiah(totalUangMasuk)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border border-border/80">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Porsi Terjual
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight">
              {totalPorsiTerjual} <span className="text-xs font-normal text-muted-foreground">porsi</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border border-border/80">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ReceiptCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Transaksi Sah
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight">
              {totalPesanan} <span className="text-xs font-normal text-muted-foreground">pesanan</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
