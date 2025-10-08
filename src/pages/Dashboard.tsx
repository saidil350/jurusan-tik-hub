import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Peminjaman {
  id: string;
  jenis_barang: 'kunci_ruang' | 'infokus';
  item_id: string;
  keperluan: string;
  waktu_pinjam: string;
  waktu_kembali: string;
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai' | 'dibatalkan';
  catatan_admin: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPeminjaman();
    }
  }, [user]);

  const fetchPeminjaman = async () => {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPeminjaman(data || []);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Menunggu' },
      disetujui: { variant: 'default' as const, icon: CheckCircle, label: 'Disetujui' },
      ditolak: { variant: 'destructive' as const, icon: XCircle, label: 'Ditolak' },
      selesai: { variant: 'outline' as const, icon: CheckCircle, label: 'Selesai' },
      dibatalkan: { variant: 'outline' as const, icon: XCircle, label: 'Dibatalkan' },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: peminjaman.length,
    pending: peminjaman.filter(p => p.status === 'pending').length,
    disetujui: peminjaman.filter(p => p.status === 'disetujui').length,
    aktif: peminjaman.filter(p => p.status === 'disetujui' && new Date(p.waktu_kembali) > new Date()).length,
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold">
            Selamat Datang, {profile.full_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.role === 'mahasiswa' ? 'NIM' : 'NIP'}: {profile.nim_nip}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Peminjaman</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Menunggu</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Disetujui</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{stats.disetujui}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Aktif</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">{stats.aktif}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Peminjaman Baru</CardTitle>
              <CardDescription className="text-sm">
                Ajukan peminjaman kunci ruang atau infokus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="sm">
                <Link to="/peminjaman">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Peminjaman
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riwayat Peminjaman</CardTitle>
              <CardDescription className="text-sm">
                Lihat semua riwayat peminjaman Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/riwayat">
                  Lihat Riwayat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Peminjaman */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Peminjaman Terbaru</CardTitle>
            <CardDescription className="text-sm">
              5 peminjaman terakhir Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : peminjaman.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Belum ada peminjaman
                </p>
                <Button asChild>
                  <Link to="/peminjaman">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Peminjaman Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {peminjaman.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {item.jenis_barang === 'kunci_ruang' ? 'Kunci Ruang' : 'Infokus/Proyektor'}
                        </p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.keperluan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.waktu_pinjam).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
