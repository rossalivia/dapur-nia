import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, UserPlus, Loader2, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('pelanggan');
  const [formData, setFormData] = useState({
    nama: '',
    no_whatsapp: '',
    alamat: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      errors.nama = 'Nama lengkap wajib diisi.';
    } else if (formData.nama.trim().length > 60) {
      errors.nama = 'Nama lengkap maksimal 60 karakter.';
    }

    const cleanPhone = formData.no_whatsapp.trim();
    if (!cleanPhone) {
      errors.no_whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^08\d{8,11}$/.test(cleanPhone)) {
      errors.no_whatsapp = 'Nomor WhatsApp harus diawali 08 dan memiliki panjang 10-13 angka.';
    }

    if (!formData.alamat.trim()) {
      errors.alamat = 'Alamat wajib diisi.';
    } else if (formData.alamat.trim().length > 200) {
      errors.alamat = 'Alamat maksimal 200 karakter.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid.';
    }

    if (!formData.password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (formData.password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register({
        nama: formData.nama.trim(),
        no_whatsapp: formData.no_whatsapp.trim(),
        alamat: formData.alamat.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: role,
      });
      navigate('/menu', { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Gagal mendaftar akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-background border border-border/70 rounded-2xl p-6 shadow-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Daftar Akun Dapur Nia
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih peran Anda untuk mulai menggunakan aplikasi
          </p>
        </div>

        {/* Pilihan Peran Akun */}
        <div className="mb-5 p-1 bg-muted/60 rounded-xl grid grid-cols-2 gap-1 border border-border/40">
          <button
            type="button"
            onClick={() => setRole('pelanggan')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              role === 'pelanggan'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-3.5 w-3.5 text-blue-500" />
            Pelanggan
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              role === 'admin'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            Pengelola / Admin
          </button>
        </div>

        {role === 'admin' && (
          <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Akun ini akan didaftarkan sebagai <strong>Pengelola / Admin</strong> dengan akses penuh ke Menu, Pelanggan, Pesanan, dan Laporan.
            </span>
          </div>
        )}

        {serverError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama">
              {role === 'admin' ? 'Nama Pengelola / Admin' : 'Nama Lengkap'}
            </Label>
            <Input
              id="nama"
              name="nama"
              placeholder={role === 'admin' ? 'Contoh: Dina (Pemilik)' : 'Contoh: Budi Santoso'}
              value={formData.nama}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.nama && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.nama}</p>
            )}
          </div>

          <div>
            <Label htmlFor="no_whatsapp">Nomor WhatsApp / Kontak</Label>
            <Input
              id="no_whatsapp"
              name="no_whatsapp"
              type="tel"
              placeholder="Contoh: 081234567890"
              value={formData.no_whatsapp}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1"
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Diawali 08, 10–13 angka
            </p>
            {fieldErrors.no_whatsapp && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.no_whatsapp}</p>
            )}
          </div>

          <div>
            <Label htmlFor="alamat">
              {role === 'admin' ? 'Alamat Kantor / Dapur' : 'Alamat Pengiriman'}
            </Label>
            <textarea
              id="alamat"
              name="alamat"
              placeholder="Contoh: Jl. Melati No. 12, RT 03/RW 05, Sukajadi"
              rows={2}
              value={formData.alamat}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
            />
            {fieldErrors.alamat && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.alamat}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={role === 'admin' ? 'dina@dapurnia.com' : 'email@contoh.com'}
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi kata sandi"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold shadow-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              `Daftar Akun ${role === 'admin' ? 'Pengelola' : 'Pelanggan'}`
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
