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
import { Pelanggan } from '@/types';
import { validatePelangganInput } from '../services/pelangganService';

interface PelangganFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nama: string; no_whatsapp: string; alamat: string }) => Promise<void>;
  initialData?: Pelanggan | null;
}

export const PelangganFormSheet: React.FC<PelangganFormSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [nama, setNama] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || '');
      setNoWhatsapp(initialData.no_whatsapp || '');
      setAlamat(initialData.alamat || '');
    } else {
      setNama('');
      setNoWhatsapp('');
      setAlamat('');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      nama: nama.trim(),
      no_whatsapp: noWhatsapp.trim(),
      alamat: alamat.trim(),
    };

    try {
      validatePelangganInput(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'Data pelanggan tidak valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data pelanggan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pelanggan-nama">Nama Pelanggan</Label>
            <Input
              id="pelanggan-nama"
              placeholder="Contoh: Budi Santoso"
              value={nama}
              maxLength={60}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {nama.length}/60 karakter
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pelanggan-wa">Nomor WhatsApp</Label>
            <Input
              id="pelanggan-wa"
              placeholder="Contoh: 081234567890"
              value={noWhatsapp}
              maxLength={13}
              onChange={(e) => setNoWhatsapp(e.target.value)}
              disabled={isEditMode}
              required
            />
            <span className="text-[10px] text-muted-foreground block">
              {isEditMode
                ? 'Nomor WhatsApp menjadi ID data dan tidak dapat diubah.'
                : 'Wajib diawali 08 (total 10–13 angka).'}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pelanggan-alamat">Alamat Pengiriman</Label>
            <textarea
              id="pelanggan-alamat"
              rows={3}
              placeholder="Contoh: Jl. Melati No. 12, RT 03/RW 05, Kelurahan Mawar"
              value={alamat}
              maxLength={200}
              onChange={(e) => setAlamat(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {alamat.length}/200 karakter
            </span>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
