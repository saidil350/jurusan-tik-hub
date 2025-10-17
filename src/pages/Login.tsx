import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundParticles from '@/components/BackgroundParticles';
import { toast } from 'sonner';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email atau password salah');
        } else {
          toast.error(error.message || 'Gagal login');
        }
      } else {
        toast.success('Login berhasil!');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundParticles />
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover mb-4">
            <span className="text-2xl font-bold text-white">TIK</span>
          </div>
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="mt-2 text-muted-foreground">
            Masuk ke akun Anda untuk mengakses layanan
          </p>
        </div>

        <Card className="border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Masuk ke Sistem</CardTitle>
              <CardDescription>
                Gunakan email dan password yang telah didaftarkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Memproses...'
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Belum punya akun?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Daftar di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
