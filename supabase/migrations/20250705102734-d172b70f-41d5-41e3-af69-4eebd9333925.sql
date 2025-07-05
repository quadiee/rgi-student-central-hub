
-- Add RLS policies for payment_transactions table to allow admins to process payments

-- Allow admins and principals to insert payment transactions
CREATE POLICY "Admins can insert payment transactions" 
    ON public.payment_transactions FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow admins and principals to view all payment transactions
CREATE POLICY "Admins can view all payment transactions" 
    ON public.payment_transactions FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow admins and principals to update payment transactions
CREATE POLICY "Admins can update payment transactions" 
    ON public.payment_transactions FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'principal')
        )
    );

-- Allow students to insert their own payment transactions (for online payments)
CREATE POLICY "Students can create their own payment transactions" 
    ON public.payment_transactions FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = student_id);
