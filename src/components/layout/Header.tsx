import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { seedInitialData } from '@/lib/seedData';
import { Button } from '@/components/ui/button';
import { Sparkles, Database, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedData = async () => {
    if (
      !window.confirm(
        'Masukkan data awal (3 menu & 3 pelanggan contoh) untuk mempermudah pengujian CRUD?'
      )
    ) {
      return;
    }

    try {
      setSeeding(true);
      const res = await seedInitialData(db);
      setSeeded(true);
      alert(`Berhasil menambahkan ${res.menusCount} menu dan ${res.pelangganCount} pelanggan contoh.`);
      setTimeout(() => setSeeded(false), 4000);
    } catch (err: any) {
      console.error('Seed error:', err);
      alert(err.message || 'Gagal menambahkan data contoh.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
            DN
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-foreground">
              Dapur Nia
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium">
              Katering Harian • Sesi 3
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedData}
          disabled={seeding || seeded}
          className="h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
          title="Isi data awal menu & pelanggan untuk pengujian"
        >
          {seeded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Tersimpan</span>
            </>
          ) : seeding ? (
            <>
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>Menyiapkan...</span>
            </>
          ) : (
            <>
              <Database className="h-3.5 w-3.5" />
              <span>Seed Data</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
