
-- Add email tracking columns to user_invitations table
ALTER TABLE public.user_invitations 
ADD COLUMN email_sent BOOLEAN DEFAULT false,
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE;
