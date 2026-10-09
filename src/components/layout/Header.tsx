import React, { useState, useContext } from 'react';
import { db } from '@/lib/firebase';
import { seedInitialData } from '@/lib/seedData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database, Check, LogOut, User as UserIcon } from 'lucide-react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      if (authContext?.logout) {
        await authContext.logout();
      }
      navigate('/login', { replace: true });
    }
  };

  const user = authContext?.user;
  const role = authContext?.role;
  const profile = authContext?.profile;

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs shrink-0">
            DN
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-bold text-base tracking-tight leading-none text-foreground truncate">
                Dapur Nia
              </h1>
              {role === 'admin' && (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0 font-medium"
                >
                  👑 Admin
                </Badge>
              )}
              {role === 'pelanggan' && (
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-1.5 py-0 font-medium"
                >
                  👤 Pelanggan
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium block truncate">
              {profile?.nama
                ? profile.nama
                : user?.email
                  ? user.email
                  : 'Katering Harian • Sesi 3'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {role === 'admin' && (
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
                  <span className="hidden sm:inline text-emerald-600 font-semibold">Tersimpan</span>
                </>
              ) : seeding ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Menyiapkan...</span>
                </>
              ) : (
                <>
                  <Database className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Seed</span>
                </>
              )}
            </Button>
          )}

          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Keluar dari akun"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
