-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('mahasiswa', 'dosen', 'admin');

-- Create enum for item types
CREATE TYPE public.item_type AS ENUM ('kunci_ruang', 'infokus');

-- Create enum for peminjaman status
CREATE TYPE public.peminjaman_status AS ENUM ('pending', 'disetujui', 'ditolak', 'selesai', 'dibatalkan');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nim_nip TEXT,
  role user_role NOT NULL DEFAULT 'mahasiswa',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create ruang (rooms) table
CREATE TABLE public.ruang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_ruang TEXT NOT NULL,
  lokasi TEXT,
  status TEXT DEFAULT 'tersedia',
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on ruang
ALTER TABLE public.ruang ENABLE ROW LEVEL SECURITY;

-- Ruang policies
CREATE POLICY "Anyone can view ruang"
  ON public.ruang FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage ruang"
  ON public.ruang FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create infokus table
CREATE TABLE public.infokus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_infokus TEXT NOT NULL,
  merk TEXT,
  status TEXT DEFAULT 'tersedia',
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on infokus
ALTER TABLE public.infokus ENABLE ROW LEVEL SECURITY;

-- Infokus policies
CREATE POLICY "Anyone can view infokus"
  ON public.infokus FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage infokus"
  ON public.infokus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create peminjaman table
CREATE TABLE public.peminjaman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jenis_barang item_type NOT NULL,
  item_id UUID NOT NULL,
  keperluan TEXT NOT NULL,
  waktu_pinjam TIMESTAMPTZ NOT NULL,
  waktu_kembali TIMESTAMPTZ NOT NULL,
  status peminjaman_status NOT NULL DEFAULT 'pending',
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on peminjaman
ALTER TABLE public.peminjaman ENABLE ROW LEVEL SECURITY;

-- Peminjaman policies
CREATE POLICY "Users can view their own peminjaman"
  ON public.peminjaman FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create peminjaman"
  ON public.peminjaman FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their pending peminjaman"
  ON public.peminjaman FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all peminjaman"
  ON public.peminjaman FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update peminjaman"
  ON public.peminjaman FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mahasiswa')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ruang_updated_at
  BEFORE UPDATE ON public.ruang
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_infokus_updated_at
  BEFORE UPDATE ON public.infokus
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_peminjaman_updated_at
  BEFORE UPDATE ON public.peminjaman
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for ruang
INSERT INTO public.ruang (nama_ruang, lokasi, status, keterangan) VALUES
('Lab Komputer 1', 'Lantai 2', 'tersedia', 'Ruang lab dengan 40 komputer'),
('Lab Komputer 2', 'Lantai 2', 'tersedia', 'Ruang lab dengan 30 komputer'),
('Lab Jaringan', 'Lantai 3', 'tersedia', 'Ruang lab jaringan dan server'),
('Ruang Kelas A', 'Lantai 1', 'tersedia', 'Ruang kelas teori'),
('Ruang Kelas B', 'Lantai 1', 'tersedia', 'Ruang kelas teori');

-- Insert sample data for infokus
INSERT INTO public.infokus (nama_infokus, merk, status, keterangan) VALUES
('Proyektor 1', 'Epson EB-X41', 'tersedia', 'Proyektor untuk ruang kelas'),
('Proyektor 2', 'BenQ MH535', 'tersedia', 'Proyektor untuk lab'),
('Proyektor 3', 'Sony VPL-DX145', 'tersedia', 'Proyektor portable'),
('Proyektor 4', 'Epson EB-S05', 'tersedia', 'Proyektor cadangan');