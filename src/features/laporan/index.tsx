import React, { useState } from 'react';
import { useLaporan } from './hooks/useLaporan';
import { LaporanSummaryCards } from './components/LaporanSummaryCards';
import { PorsiTerjualTable } from './components/PorsiTerjualTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { getTodayDateString, formatRupiah } from '@/lib/formatters';
import { BarChart3, Calendar, Clock } from 'lucide-react';
import { getStatusBadge } from '@/features/pesanan/components/PesananCard';

export const LaporanFeature: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const { laporan, loading, error } = useLaporan(selectedDate);

  const hasOrders = (laporan?.pesananList?.length ?? 0) > 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Module Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Laporan Penjualan
        </h1>
        <p className="text-xs text-muted-foreground">
          Ringkasan omset dan porsi katering terjual per tanggal
        </p>
      </div>

      {/* Date Filter Card */}
      <Card className="bg-card shadow-sm border border-border/80">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <Label htmlFor="laporan-date" className="cursor-pointer text-xs">
              Pilih Tanggal:
            </Label>
          </div>
          <Input
            id="laporan-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto h-8 text-xs font-medium"
          />
        </CardContent>
      </Card>

      {loading && <LoadingState message="Menghitung rekap laporan penjualan..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && !hasOrders && (
        <EmptyState
          title="Belum Ada Penjualan"
          description={`Belum ada pesanan sah pada tanggal ${selectedDate}. Pesanan yang dibatalkan tidak dihitung dalam rekapitulasi omset.`}
        />
      )}

      {!loading && !error && hasOrders && laporan && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <LaporanSummaryCards
            totalPorsiTerjual={laporan.totalPorsiTerjual}
            totalUangMasuk={laporan.totalUangMasuk}
            totalPesanan={laporan.pesananList.length}
          />

          {/* Breakdown Menu Portions */}
          <PorsiTerjualTable porsiPerMenu={laporan.porsiPerMenu} />

          {/* List of Orders included in report */}
          <Card className="bg-card shadow-sm border border-border/80 overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Daftar Transaksi Tanggal {selectedDate}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {laporan.pesananList.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/60 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-foreground truncate">{p.nama_pelanggan}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.nama_menu} × {p.jumlah_porsi} porsi
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">{formatRupiah(p.total)}</p>
                    <div className="mt-0.5">{getStatusBadge(p.status)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LaporanFeature;
