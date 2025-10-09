-- Security Enhancement: Strengthen profiles table protection
-- This migration adds additional safeguards for personal contact information

-- Add security comments to document critical requirements
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: This table contains personal information (phone, NIM/NIP). RLS MUST remain enabled at all times. Any attempt to disable RLS should trigger immediate security review.';
COMMENT ON COLUMN public.profiles.phone IS 'SENSITIVE: Personal phone numbers. Only accessible by record owner or verified admins via has_role().';
COMMENT ON COLUMN public.profiles.nim_nip IS 'SENSITIVE: Student/staff identification numbers. Only accessible by record owner or verified admins.';

-- Create a function to validate RLS is enabled (for monitoring purposes)
CREATE OR REPLACE FUNCTION public.check_profiles_rls_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT relrowsecurity 
  FROM pg_class 
  WHERE relname = 'profiles' 
  AND relnamespace = 'public'::regnamespace;
$$;

COMMENT ON FUNCTION public.check_profiles_rls_enabled() IS 'Security monitoring function - returns true if RLS is enabled on profiles table';

-- Add a constraint to ensure phone numbers follow a valid format (if provided)
-- This prevents injection of malicious data
ALTER TABLE public.profiles 
ADD CONSTRAINT phone_format_check 
CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$');

-- Add a constraint to ensure NIM/NIP follows expected format (if provided)
ALTER TABLE public.profiles 
ADD CONSTRAINT nim_nip_format_check 
CHECK (nim_nip IS NULL OR length(nim_nip) >= 5);

-- Create an audit log function for sensitive profile access (for future auditing)
CREATE TABLE IF NOT EXISTS public.profile_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_profile_id uuid NOT NULL,
  accessed_by_user_id uuid NOT NULL,
  access_time timestamp with time zone NOT NULL DEFAULT now(),
  access_type text NOT NULL
);

-- Enable RLS on the audit log table
ALTER TABLE public.profile_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.profile_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

COMMENT ON TABLE public.profile_access_log IS 'Audit log for tracking access to sensitive profile information';

-- Verify that the has_role function has correct security settings
-- This ensures the admin check cannot be bypassed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'has_role'
    AND p.prosecdef = true  -- SECURITY DEFINER
  ) THEN
    RAISE EXCEPTION 'SECURITY ERROR: has_role function must be SECURITY DEFINER';
  END IF;
END $$;