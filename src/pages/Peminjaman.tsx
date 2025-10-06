import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Ruang {
  id: string;
  nama_ruang: string;
  lokasi: string;
  status: string;
}

interface Infokus {
  id: string;
  nama_infokus: string;
  merk: string;
  status: string;
}

interface JadwalDosen {
  id: string;
  dosen_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mata_kuliah: string;
  profiles: {
    full_name: string;
    nim_nip: string;
  };
}

export default function Peminjaman() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [jenisBarang, setJenisBarang] = useState<'kunci_ruang' | 'infokus' | ''>('');
  const [itemId, setItemId] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [hari, setHari] = useState('');
  const [jamPinjam, setJamPinjam] = useState('');
  const [jamKembali, setJamKembali] = useState('');
  const [ruangList, setRuangList] = useState<Ruang[]>([]);
  const [infokusList, setInfokusList] = useState<Infokus[]>([]);
  const [dosenList, setDosenList] = useState<JadwalDosen[]>([]);
  const [loadingDosen, setLoadingDosen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchRuang();
    fetchInfokus();
  }, []);

  const fetchRuang = async () => {
    const { data, error } = await supabase
      .from('ruang')
      .select('*')
      .eq('status', 'tersedia')
      .order('nama_ruang');

    if (!error && data) {
      setRuangList(data);
    }
  };

  const fetchInfokus = async () => {
    const { data, error } = await supabase
      .from('infokus')
      .select('*')
      .eq('status', 'tersedia')
      .order('nama_infokus');

    if (!error && data) {
      setInfokusList(data);
    }
  };

  const cariDosen = async () => {
    if (!hari || !jamPinjam || !jamKembali) {
      toast.error('Pilih hari dan jam terlebih dahulu');
      return;
    }

    if (jamKembali <= jamPinjam) {
      toast.error('Jam kembali harus lebih dari jam pinjam');
      return;
    }

    setLoadingDosen(true);
    try {
      const { data, error } = await supabase
        .from('jadwal_dosen')
        .select(`
          *,
          profiles:dosen_id (
            full_name,
            nim_nip
          )
        `)
        .eq('hari', hari)
        .gte('jam_selesai', jamPinjam)
        .lte('jam_mulai', jamKembali);

      if (error) throw error;
      setDosenList(data || []);

      if (data && data.length === 0) {
        toast.info('Tidak ada dosen yang mengajar pada waktu tersebut');
      } else {
        toast.success(`Ditemukan ${data?.length || 0} dosen yang mengajar`);
      }
    } catch (error) {
      console.error('Error fetching dosen:', error);
      toast.error('Gagal mencari data dosen');
    } finally {
      setLoadingDosen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jenisBarang || !itemId || !keperluan || !jamPinjam || !jamKembali) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (jamKembali <= jamPinjam) {
      toast.error('Jam kembali harus lebih dari jam pinjam');
      return;
    }

    setSubmitting(true);

    try {
      // Use today's date with selected times
      const today = new Date();
      
      const waktuPinjam = new Date(today);
      const [hourPinjam, minutePinjam] = jamPinjam.split(':');
      waktuPinjam.setHours(parseInt(hourPinjam), parseInt(minutePinjam), 0, 0);

      const waktuKembali = new Date(today);
      const [hourKembali, minuteKembali] = jamKembali.split(':');
      waktuKembali.setHours(parseInt(hourKembali), parseInt(minuteKembali), 0, 0);

      const { error } = await supabase.from('peminjaman').insert({
        user_id: user?.id,
        jenis_barang: jenisBarang,
        item_id: itemId,
        keperluan: keperluan,
        waktu_pinjam: waktuPinjam.toISOString(),
        waktu_kembali: waktuKembali.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Peminjaman berhasil diajukan!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting peminjaman:', error);
      toast.error('Gagal mengajukan peminjaman');
    } finally {
      setSubmitting(false);
    }
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
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Form Peminjaman</h1>
          <p className="text-muted-foreground">
            Ajukan peminjaman kunci ruang atau infokus/proyektor
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Peminjaman</CardTitle>
            <CardDescription>
              Lengkapi formulir di bawah ini dengan benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nama Peminjam</Label>
                <Input value={profile.full_name} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenisBarang">Jenis Barang *</Label>
                <Select
                  value={jenisBarang}
                  onValueChange={(value: 'kunci_ruang' | 'infokus') => {
                    setJenisBarang(value);
                    setItemId('');
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="jenisBarang">
                    <SelectValue placeholder="Pilih jenis barang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kunci_ruang">Kunci Ruang</SelectItem>
                    <SelectItem value="infokus">Infokus/Proyektor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {jenisBarang && (
                <div className="space-y-2">
                  <Label htmlFor="itemId">
                    {jenisBarang === 'kunci_ruang' ? 'Pilih Ruang' : 'Pilih Infokus'} *
                  </Label>
                  <Select
                    value={itemId}
                    onValueChange={setItemId}
                    disabled={submitting}
                  >
                    <SelectTrigger id="itemId">
                      <SelectValue placeholder={`Pilih ${jenisBarang === 'kunci_ruang' ? 'ruang' : 'infokus'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisBarang === 'kunci_ruang'
                        ? ruangList.map((ruang) => (
                            <SelectItem key={ruang.id} value={ruang.id}>
                              {ruang.nama_ruang} - {ruang.lokasi}
                            </SelectItem>
                          ))
                        : infokusList.map((infokus) => (
                            <SelectItem key={infokus.id} value={infokus.id}>
                              {infokus.nama_infokus} ({infokus.merk})
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="keperluan">Keperluan *</Label>
                <Textarea
                  id="keperluan"
                  placeholder="Jelaskan keperluan peminjaman"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hari">Hari *</Label>
                <Select
                  value={hari}
                  onValueChange={setHari}
                  disabled={submitting}
                >
                  <SelectTrigger id="hari">
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Senin">Senin</SelectItem>
                    <SelectItem value="Selasa">Selasa</SelectItem>
                    <SelectItem value="Rabu">Rabu</SelectItem>
                    <SelectItem value="Kamis">Kamis</SelectItem>
                    <SelectItem value="Jumat">Jumat</SelectItem>
                    <SelectItem value="Sabtu">Sabtu</SelectItem>
                    <SelectItem value="Minggu">Minggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jamPinjam">Jam Pinjam *</Label>
                  <Input
                    id="jamPinjam"
                    type="time"
                    value={jamPinjam}
                    onChange={(e) => setJamPinjam(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jamKembali">Jam Kembali *</Label>
                  <Input
                    id="jamKembali"
                    type="time"
                    value={jamKembali}
                    onChange={(e) => setJamKembali(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Search Dosen Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cariDosen}
                  disabled={!hari || !jamPinjam || !jamKembali || loadingDosen}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loadingDosen ? 'Mencari...' : 'Cari Dosen yang Mengajar'}
                </Button>
              </div>

              {/* Dosen List Display */}
              {dosenList.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Dosen yang Mengajar</CardTitle>
                    <CardDescription>
                      Dosen yang mengajar pada {hari}, {jamPinjam} - {jamKembali}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dosenList.map((jadwal) => (
                        <div
                          key={jadwal.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border"
                        >
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{jadwal.profiles.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                NIP: {jadwal.profiles.nim_nip}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {jadwal.mata_kuliah}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    'Mengirim...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Ajukan Peminjaman
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
