-- Categories table for organizing session types and bookings
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  color text NOT NULL DEFAULT 'blue' CHECK (color IN ('red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'gray', 'slate', 'zinc', 'neutral', 'stone')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key reference to users (assuming auth.users)
ALTER TABLE public.categories
ADD CONSTRAINT categories_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Ensure unique category names per user
ALTER TABLE public.categories
ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "categories_owner_select" ON public.categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_owner_crud" ON public.categories
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add category_id to event_types table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_types' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.event_types
    ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add category_id to bookings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);
CREATE INDEX IF NOT EXISTS event_types_category_id_idx ON public.event_types (category_id);
CREATE INDEX IF NOT EXISTS bookings_category_id_idx ON public.bookings (category_id);

-- Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');
