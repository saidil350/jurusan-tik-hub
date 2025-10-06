-- Create jadwal table to track lecturer schedules
CREATE TABLE public.jadwal_dosen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hari TEXT NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  mata_kuliah TEXT NOT NULL,
  ruang_id UUID REFERENCES public.ruang(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.jadwal_dosen ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view jadwal"
ON public.jadwal_dosen
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage jadwal"
ON public.jadwal_dosen
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_jadwal_dosen_updated_at
BEFORE UPDATE ON public.jadwal_dosen
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO public.jadwal_dosen (dosen_id, hari, jam_mulai, jam_selesai, mata_kuliah, ruang_id)
SELECT 
  p.id,
  'Senin',
  '08:00:00',
  '10:00:00',
  'Jaringan Komputer',
  r.id
FROM public.profiles p
CROSS JOIN public.ruang r
WHERE p.role = 'dosen'
LIMIT 1;