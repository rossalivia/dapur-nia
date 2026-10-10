import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '@/features/auth/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Phone, MapPin, Mail, Shield, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const profile = authContext?.profile;
  const role = authContext?.role;

  const [nama, setNama] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNama(profile?.nama || user?.displayName || user?.email?.split('@')[0] || '');
      setNoWhatsapp(profile?.no_whatsapp || '');
      setAlamat(profile?.alamat || '');
      setErrorMsg(null);
      setSaveSuccess(false);
    }
  }, [isOpen, profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNama = nama.trim();
    const cleanPhone = noWhatsapp.trim();
    const cleanAlamat = alamat.trim();

    if (!cleanNama) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (cleanNama.length > 60) {
      setErrorMsg('Nama maksimal 60 karakter.');
      return;
    }
    if (!/^08\d{8,11}$/.test(cleanPhone)) {
      setErrorMsg('Nomor WhatsApp harus diawali 08 dan memiliki panjang 10-13 digit angka.');
      return;
    }
    if (!cleanAlamat) {
      setErrorMsg('Alamat pengiriman wajib diisi.');
      return;
    }
    if (cleanAlamat.length > 200) {
      setErrorMsg('Alamat maksimal 200 karakter.');
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfile = {
        id: cleanPhone,
        nama: cleanNama,
        no_whatsapp: cleanPhone,
        alamat: cleanAlamat,
        email: user?.email?.toLowerCase() || '',
        role: role || 'pelanggan',
        user_id: user?.uid || '',
      };

      // Simpan ke Firestore
      await setDoc(doc(db, 'pelanggan', cleanPhone), updatedProfile, { merge: true });

      // Simpan nomor hp stabil di localStorage
      if (user?.uid) {
        localStorage.setItem('dapur_nia_wa_' + user.uid, cleanPhone);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
        // Refresh page or trigger context update jika perlu
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profil Pengguna
            </DialogTitle>
            <Badge
              variant="outline"
              className={
                role === 'admin'
                  ? 'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300'
                  : 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300'
              }
            >
              <Shield className="h-3 w-3 mr-1" />
              {role === 'admin' ? 'Pengelola / Admin' : 'Pelanggan'}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Profil berhasil diperbarui!
            </div>
          )}

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <Label htmlFor="prof-email" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Email Akun (Terkunci)
            </Label>
            <Input
              id="prof-email"
              value={user?.email || '-'}
              disabled
              className="bg-muted/50 cursor-not-allowed text-xs"
            />
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="prof-nama" className="flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5 text-primary" />
              Nama Lengkap
            </Label>
            <Input
              id="prof-nama"
              value={nama}
              maxLength={60}
              placeholder="Contoh: Siti Rahma"
              onChange={(e) => setNama(e.target.value)}
              required
              className="text-xs"
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {nama.length}/60 karakter
            </span>
          </div>

          {/* No WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="prof-wa" className="flex items-center gap-1.5 text-xs">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Nomor WhatsApp (Diawali 08)
            </Label>
            <Input
              id="prof-wa"
              value={noWhatsapp}
              placeholder="08123456789"
              onChange={(e) => setNoWhatsapp(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={13}
              className="font-mono text-xs"
            />
            <span className="text-[10px] text-muted-foreground">
              Digunakan untuk pengiriman pesanan dan konfirmasi WhatsApp.
            </span>
          </div>

          {/* Alamat Pengiriman */}
          <div className="space-y-1.5">
            <Label htmlFor="prof-alamat" className="flex items-center gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Alamat Pengiriman Utama
            </Label>
            <textarea
              id="prof-alamat"
              value={alamat}
              maxLength={200}
              placeholder="Jl. Merdeka No. 12, Kel. Sukamaju, Kec. Cilincing..."
              onChange={(e) => setAlamat(e.target.value)}
              rows={3}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {alamat.length}/200 karakter
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
