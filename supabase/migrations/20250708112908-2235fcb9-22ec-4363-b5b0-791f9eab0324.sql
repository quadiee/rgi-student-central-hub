-- Update profiles RLS policy to allow chairman to view all profiles
CREATE POLICY "Chairman can view all profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles chairman_profile
    WHERE chairman_profile.id = auth.uid() 
    AND chairman_profile.role = 'chairman'
  )
);

-- Update fee_records RLS policy to allow chairman to view all fee records  
CREATE POLICY "Chairman can view all fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles chairman_profile
    WHERE chairman_profile.id = auth.uid() 
    AND chairman_profile.role = 'chairman'
  )
);