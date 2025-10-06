-- Fix infinite recursion by implementing proper user roles system
-- Use existing user_role enum instead of creating new one

-- 1. Create user_roles table using existing user_role enum
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Drop all existing policies on profiles that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 5. Create new RLS policies for profiles using has_role function
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 6. Update RLS policies for peminjaman table
DROP POLICY IF EXISTS "Admins can view all peminjaman" ON public.peminjaman;
DROP POLICY IF EXISTS "Admins can update peminjaman" ON public.peminjaman;

CREATE POLICY "Admins can view all peminjaman"
ON public.peminjaman
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update peminjaman"
ON public.peminjaman
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update RLS policies for ruang table
DROP POLICY IF EXISTS "Admins can manage ruang" ON public.ruang;

CREATE POLICY "Admins can manage ruang"
ON public.ruang
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Update RLS policies for infokus table
DROP POLICY IF EXISTS "Admins can manage infokus" ON public.infokus;

CREATE POLICY "Admins can manage infokus"
ON public.infokus
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Update handle_new_user function to create both profile and user_roles entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, role, nim_nip)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mahasiswa'),
    NEW.raw_user_meta_data->>'nim_nip'
  );
  
  -- Insert into user_roles (for secure role checking)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mahasiswa')
  );
  
  RETURN NEW;
END;
$$;