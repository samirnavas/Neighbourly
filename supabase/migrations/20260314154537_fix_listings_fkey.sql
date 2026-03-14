-- Drop the existing foreign key referencing auth.users
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_owner_id_fkey;

-- Add the new foreign key referencing public.profiles with cascading delete
ALTER TABLE public.listings
  ADD CONSTRAINT listings_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
