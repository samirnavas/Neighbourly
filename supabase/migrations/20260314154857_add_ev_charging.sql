-- Add the has_ev_charging column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS has_ev_charging BOOLEAN DEFAULT false;
