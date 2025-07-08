
-- Create fee_templates table that's referenced in FeeTemplateManager
CREATE TABLE public.fee_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fee_type_id UUID REFERENCES public.fee_types(id),
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.fee_templates ENABLE ROW LEVEL SECURITY;

-- Allow admins and principals to manage templates
CREATE POLICY "Admins can manage fee templates" 
  ON public.fee_templates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  ));

-- Allow authenticated users to view templates
CREATE POLICY "Authenticated users can view fee templates" 
  ON public.fee_templates 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
