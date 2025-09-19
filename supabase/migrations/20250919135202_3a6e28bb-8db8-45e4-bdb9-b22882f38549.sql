-- Add email field to engineering_submissions table
ALTER TABLE public.engineering_submissions 
ADD COLUMN email TEXT NOT NULL DEFAULT '';