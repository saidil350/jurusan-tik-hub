import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nimNip: '',
    phone: '',
    role: '' as 'mahasiswa' | 'dosen' | '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.role || !formData.nimNip) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.nimNip,
        formData.role as 'mahasiswa' | 'dosen'
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email sudah terdaftar');
        } else {
          toast.error(error.message || 'Gagal mendaftar');
        }
      } else {
        toast.success('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover mb-4">
            <span className="text-2xl font-bold text-white">TIK</span>
          </div>
          <h1 className="text-3xl font-bold">Daftar</h1>
          <p className="mt-2 text-muted-foreground">
            Buat akun baru untuk mengakses layanan
          </p>
        </div>

        <Card className="border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Registrasi Akun</CardTitle>
              <CardDescription>
                Lengkapi data diri Anda untuk membuat akun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'mahasiswa' | 'dosen') => 
                    setFormData({ ...formData, role: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    <SelectItem value="dosen">Dosen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nimNip">
                  {formData.role === 'mahasiswa' ? 'NIM' : 'NIP'} *
                </Label>
                <Input
                  id="nimNip"
                  placeholder={formData.role === 'mahasiswa' ? 'Masukkan NIM' : 'Masukkan NIP'}
                  value={formData.nimNip}
                  onChange={(e) => setFormData({ ...formData, nimNip: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon (Opsional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    <UserPlus className="mr-2 h-4 w-4" />
                    Daftar
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
