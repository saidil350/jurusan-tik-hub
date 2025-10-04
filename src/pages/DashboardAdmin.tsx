import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Users, Key, Projector, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PeminjamanWithProfile {
  id: string;
  jenis_barang: 'kunci_ruang' | 'infokus';
  item_id: string;
  keperluan: string;
  waktu_pinjam: string;
  waktu_kembali: string;
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai' | 'dibatalkan';
  catatan_admin: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    nim_nip: string;
    role: string;
  };
}

export default function DashboardAdmin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState<PeminjamanWithProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/dashboard');
      toast.error('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchPeminjaman();
    }
  }, [user, profile]);

  const fetchPeminjaman = async () => {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          profiles (
            full_name,
            nim_nip,
            role
          )
        `)
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

  const handleAction = async () => {
    if (!selectedPeminjaman || !actionType) return;

    setProcessing(true);

    try {
      const newStatus = actionType === 'approve' ? 'disetujui' : 'ditolak';
      
      const { error } = await supabase
        .from('peminjaman')
        .update({
          status: newStatus,
          catatan_admin: catatan || null,
        })
        .eq('id', selectedPeminjaman.id);

      if (error) throw error;

      toast.success(`Peminjaman ${actionType === 'approve' ? 'disetujui' : 'ditolak'}`);
      fetchPeminjaman();
      setSelectedPeminjaman(null);
      setActionType(null);
      setCatatan('');
    } catch (error) {
      console.error('Error updating peminjaman:', error);
      toast.error('Gagal memproses peminjaman');
    } finally {
      setProcessing(false);
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

  if (loading || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  const pendingPeminjaman = peminjaman.filter(p => p.status === 'pending');
  const approvedPeminjaman = peminjaman.filter(p => p.status === 'disetujui');
  const historyPeminjaman = peminjaman.filter(p => ['ditolak', 'selesai', 'dibatalkan'].includes(p.status));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Kelola semua peminjaman dan data sistem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Peminjaman</CardDescription>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Menunggu Persetujuan</CardDescription>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <CardTitle className="text-4xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Disetujui</CardDescription>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-4xl text-green-600">{stats.disetujui}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Peminjaman Aktif</CardDescription>
                <Key className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-4xl text-primary">{stats.aktif}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for different categories */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Menunggu ({pendingPeminjaman.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Disetujui ({approvedPeminjaman.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Riwayat ({historyPeminjaman.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loadingData ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">Memuat data...</p>
                </CardContent>
              </Card>
            ) : pendingPeminjaman.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Tidak ada peminjaman yang menunggu persetujuan</p>
                </CardContent>
              </Card>
            ) : (
              pendingPeminjaman.map((item) => (
                <Card key={item.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {item.jenis_barang === 'kunci_ruang' ? (
                            <Key className="h-5 w-5" />
                          ) : (
                            <Projector className="h-5 w-5" />
                          )}
                          {item.jenis_barang === 'kunci_ruang' ? 'Kunci Ruang' : 'Infokus/Proyektor'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Peminjam: {item.profiles.full_name} ({item.profiles.nim_nip})
                        </CardDescription>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedPeminjaman(item);
                          setActionType('approve');
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPeminjaman(item);
                          setActionType('reject');
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedPeminjaman.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Tidak ada peminjaman yang disetujui</p>
                </CardContent>
              </Card>
            ) : (
              approvedPeminjaman.map((item) => (
                <Card key={item.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {item.jenis_barang === 'kunci_ruang' ? (
                            <Key className="h-5 w-5" />
                          ) : (
                            <Projector className="h-5 w-5" />
                          )}
                          {item.jenis_barang === 'kunci_ruang' ? 'Kunci Ruang' : 'Infokus/Proyektor'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Peminjam: {item.profiles.full_name} ({item.profiles.nim_nip})
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
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Catatan Admin:</p>
                        <p className="text-sm text-muted-foreground">{item.catatan_admin}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historyPeminjaman.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada riwayat</p>
                </CardContent>
              </Card>
            ) : (
              historyPeminjaman.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {item.jenis_barang === 'kunci_ruang' ? (
                            <Key className="h-5 w-5" />
                          ) : (
                            <Projector className="h-5 w-5" />
                          )}
                          {item.jenis_barang === 'kunci_ruang' ? 'Kunci Ruang' : 'Infokus/Proyektor'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Peminjam: {item.profiles.full_name} ({item.profiles.nim_nip})
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
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Catatan Admin:</p>
                        <p className="text-sm text-muted-foreground">{item.catatan_admin}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Dialog */}
      <Dialog open={!!selectedPeminjaman} onOpenChange={() => {
        setSelectedPeminjaman(null);
        setActionType(null);
        setCatatan('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Tambahkan catatan untuk peminjam (opsional)'
                : 'Jelaskan alasan penolakan peminjaman'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan {actionType === 'reject' && '*'}</Label>
              <Textarea
                id="catatan"
                placeholder={actionType === 'approve' 
                  ? 'Catatan untuk peminjam (opsional)'
                  : 'Jelaskan alasan penolakan'
                }
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPeminjaman(null);
                setActionType(null);
                setCatatan('');
              }}
              disabled={processing}
            >
              Batal
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing || (actionType === 'reject' && !catatan)}
            >
              {processing ? 'Memproses...' : (actionType === 'approve' ? 'Setujui' : 'Tolak')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
