-- Enable RLS on department_fee_analytics view
ALTER TABLE public.department_fee_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for admins, principals, and chairman to view department analytics
CREATE POLICY "Admins and chairman can view department analytics" 
ON public.department_fee_analytics
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  )
);

-- Create policy for HODs to view their department analytics
CREATE POLICY "HODs can view their department analytics" 
ON public.department_fee_analytics
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'hod'
    AND p.department_id = department_fee_analytics.department_id
  )
);