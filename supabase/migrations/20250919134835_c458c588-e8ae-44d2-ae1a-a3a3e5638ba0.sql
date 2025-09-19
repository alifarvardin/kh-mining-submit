-- Create a table for engineering form submissions
CREATE TABLE public.engineering_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  membership_number TEXT NOT NULL,
  national_id TEXT NOT NULL,
  file_title TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  cadastral_code TEXT NOT NULL,
  license_number TEXT,
  description TEXT,
  file_count INTEGER NOT NULL DEFAULT 0,
  file_names TEXT[], -- Array to store file names
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (since this is a public form, allow all operations)
ALTER TABLE public.engineering_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to the table
CREATE POLICY "Allow all operations on engineering_submissions" 
ON public.engineering_submissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_engineering_submissions_updated_at
BEFORE UPDATE ON public.engineering_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();