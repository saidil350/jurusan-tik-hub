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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function Peminjaman() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [jenisBarang, setJenisBarang] = useState<'kunci_ruang' | 'infokus' | ''>('');
  const [itemId, setItemId] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState<Date>();
  const [jamPinjam, setJamPinjam] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState<Date>();
  const [jamKembali, setJamKembali] = useState('');
  const [ruangList, setRuangList] = useState<Ruang[]>([]);
  const [infokusList, setInfokusList] = useState<Infokus[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jenisBarang || !itemId || !keperluan || !tanggalPinjam || !jamPinjam || !tanggalKembali || !jamKembali) {
      toast.error('Semua field wajib diisi');
      return;
    }

    const waktuPinjam = new Date(tanggalPinjam);
    const [hourPinjam, minutePinjam] = jamPinjam.split(':');
    waktuPinjam.setHours(parseInt(hourPinjam), parseInt(minutePinjam), 0, 0);

    const waktuKembali = new Date(tanggalKembali);
    const [hourKembali, minuteKembali] = jamKembali.split(':');
    waktuKembali.setHours(parseInt(hourKembali), parseInt(minuteKembali), 0, 0);

    if (waktuKembali <= waktuPinjam) {
      toast.error('Waktu kembali harus lebih dari waktu pinjam');
      return;
    }

    setSubmitting(true);

    try {
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tanggal Pinjam *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !tanggalPinjam && 'text-muted-foreground'
                        )}
                        disabled={submitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tanggalPinjam ? format(tanggalPinjam, 'PPP') : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tanggalPinjam}
                        onSelect={setTanggalPinjam}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tanggal Kembali *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !tanggalKembali && 'text-muted-foreground'
                        )}
                        disabled={submitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tanggalKembali ? format(tanggalKembali, 'PPP') : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tanggalKembali}
                        onSelect={setTanggalKembali}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                      />
                    </PopoverContent>
                  </Popover>
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
