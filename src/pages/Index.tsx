import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Sistem Pelayanan
              <br />
              <span className="text-accent">Jurusan TIK</span>
            </h1>
            <p className="mb-8 text-lg text-blue-50 sm:text-xl">
              Platform terintegrasi untuk peminjaman kunci ruang dan infokus/proyektor
              secara efisien dan terorganisir
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="bg-accent hover:bg-accent-hover text-white">
                <Link to="/register">
                  Daftar Sekarang
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Fitur Layanan
            </h2>
            <p className="text-lg text-muted-foreground">
              Kemudahan dalam satu sistem terintegrasi
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Aturan Peminjaman
              </h2>
              <p className="text-lg text-muted-foreground">
                Harap patuhi ketentuan berikut untuk kelancaran layanan
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-foreground">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <Users className="h-16 w-16 text-primary" />
              <div>
                <h2 className="mb-4 text-3xl font-bold">
                  Siap Memulai?
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
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
  );
}
