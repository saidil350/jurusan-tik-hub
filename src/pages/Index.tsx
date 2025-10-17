import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import BackgroundParticles from '@/components/BackgroundParticles';
import { Key, Projector, Clock, Shield, CheckCircle, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Key,
      title: 'Peminjaman Kunci Ruang',
      description: 'Pinjam kunci ruang laboratorium dan kelas dengan mudah',
    },
    {
      icon: Projector,
      title: 'Peminjaman Infokus',
      description: 'Booking proyektor/infokus untuk kegiatan perkuliahan',
    },
    {
      icon: Clock,
      title: 'Manajemen Waktu',
      description: 'Sistem penjadwalan otomatis untuk menghindari bentrok',
    },
    {
      icon: Shield,
      title: 'Akses Aman',
      description: 'Keamanan data terjamin dengan sistem autentikasi',
    },
  ];

  const rules = [
    'Peminjaman harus dilakukan minimal H-1 sebelum penggunaan',
    'Waktu peminjaman maksimal 4 jam per sesi',
    'Barang harus dikembalikan tepat waktu sesuai jadwal',
    'Kerusakan atau kehilangan menjadi tanggung jawab peminjam',
    'Untuk keperluan mendesak, hubungi admin jurusan',
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundParticles />
      <div className="relative z-10">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Sistem Pelayanan Digital</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Sistem Pelayanan
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Jurusan TIK
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Platform terintegrasi untuk peminjaman kunci ruang dan infokus/proyektor
              secara efisien dan terorganisir
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Daftar Sekarang
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Fitur Layanan
            </h2>
            <p className="text-muted-foreground">
              Kemudahan dalam satu sistem terintegrasi
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">
                Aturan Peminjaman
              </h2>
              <p className="text-muted-foreground">
                Harap patuhi ketentuan berikut untuk kelancaran layanan
              </p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Siap Memulai?
                </h2>
                <p className="text-muted-foreground">
                  Daftar sekarang dan nikmati kemudahan layanan peminjaman
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/register">
                  Daftar Gratis
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Sistem Pelayanan Jurusan TIK. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
