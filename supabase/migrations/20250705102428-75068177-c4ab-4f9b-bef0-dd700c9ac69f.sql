
-- Add RLS policies for fee_records table to allow admins to insert and manage fee records

-- Allow admins and principals to insert fee records
CREATE POLICY "Admins can insert fee records" 
    ON public.fee_records FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow admins and principals to update fee records
CREATE POLICY "Admins can update fee records" 
    ON public.fee_records FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow admins and principals to view all fee records
CREATE POLICY "Admins can view all fee records" 
    ON public.fee_records FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow HODs to view fee records for their department students
CREATE POLICY "HODs can view department fee records" 
    ON public.fee_records FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.department_id = p2.department_id
            WHERE p1.id = auth.uid() 
            AND p1.role = 'hod'
            AND p2.id = fee_records.student_id
        )
    );
