import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

export default function Riwayat() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cancelingId, setCancelingId] = useState<string | null>(null);

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPeminjaman(data || []);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('peminjaman')
        .update({ status: 'dibatalkan' })
        .eq('id', id)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Peminjaman berhasil dibatalkan');
      fetchPeminjaman();
    } catch (error) {
      console.error('Error canceling peminjaman:', error);
      toast.error('Gagal membatalkan peminjaman');
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Menunggu', color: 'text-yellow-600' },
      disetujui: { variant: 'default' as const, icon: CheckCircle, label: 'Disetujui', color: 'text-green-600' },
      ditolak: { variant: 'destructive' as const, icon: XCircle, label: 'Ditolak', color: 'text-red-600' },
      selesai: { variant: 'outline' as const, icon: CheckCircle, label: 'Selesai', color: 'text-gray-600' },
      dibatalkan: { variant: 'outline' as const, icon: XCircle, label: 'Dibatalkan', color: 'text-gray-600' },
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

  const filteredPeminjaman = filterStatus === 'all'
    ? peminjaman
    : peminjaman.filter(p => p.status === filterStatus);

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Riwayat Peminjaman</h1>
            <p className="text-muted-foreground">
              Semua riwayat peminjaman Anda
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter Status</CardTitle>
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loadingData ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Memuat data...</p>
            </CardContent>
          </Card>
        ) : filteredPeminjaman.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterStatus === 'all' 
                  ? 'Belum ada riwayat peminjaman'
                  : `Tidak ada peminjaman dengan status "${filterStatus}"`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPeminjaman.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {item.jenis_barang === 'kunci_ruang' ? 'Kunci Ruang' : 'Infokus/Proyektor'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Keperluan:</p>
                    <p className="text-sm text-muted-foreground">{item.keperluan}</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Waktu Pinjam:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.waktu_pinjam).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Waktu Kembali:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.waktu_kembali).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {item.catatan_admin && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Catatan Admin:</p>
                      <p className="text-sm text-muted-foreground">{item.catatan_admin}</p>
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancelingId(item.id)}
                      className="mt-4"
                    >
                      Batalkan Peminjaman
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Peminjaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan peminjaman ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelingId && handleCancel(cancelingId)}>
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
