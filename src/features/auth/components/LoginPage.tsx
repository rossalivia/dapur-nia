import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Loader2, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!email.trim() || !password) {
      setServerError('Email dan kata sandi wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      navigate('/menu', { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-background border border-border/70 rounded-2xl p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
            DN
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Masuk ke Dapur Nia
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Katering Harian • Masuk untuk mengelola atau memesan menu
          </p>
        </div>

        {serverError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Kata Sandi</Label>
            </div>
            <div className="relative mt-1">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-semibold shadow-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memeriksa Akun...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Masuk ke Akun
              </>
            )}
          </Button>
        </form>

        {/* Demo Fast Fill untuk Uji Coba */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <p className="text-[11px] font-medium text-muted-foreground text-center mb-2.5">
            Akun Cepat untuk Uji Coba:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFillDemo('admin@dapurnia.com', 'admin123')}
              className="text-xs h-8 gap-1.5 border-dashed"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              Demo Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFillDemo('pelanggan@dapurnia.com', 'pelanggan123')}
              className="text-xs h-8 gap-1.5 border-dashed"
            >
              <User className="h-3.5 w-3.5 text-blue-500" />
              Demo Pelanggan
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar sebagai Pelanggan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
