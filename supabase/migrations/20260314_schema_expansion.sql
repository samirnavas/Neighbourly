-- ============================================================
-- Neighbourly - Schema Expansion Migration
-- Date: 2026-03-14
-- Description: Adds phone/trust to profiles, hourly booking &
--              EV charging to listings, timing fields to bookings,
--              and creates reviews + messages tables with RLS.
-- ============================================================


-- ============================================================
-- 1. ALTER profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number    TEXT,
  ADD COLUMN IF NOT EXISTS trust_score     NUMERIC  NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS total_reviews   INT      NOT NULL DEFAULT 0;


-- ============================================================
-- 2. ALTER listings
-- ============================================================
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS address_text           TEXT,
  ADD COLUMN IF NOT EXISTS price_per_hour         NUMERIC,
  ADD COLUMN IF NOT EXISTS ev_charging_available  BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ev_price_per_hour      NUMERIC,                          -- nullable
  ADD COLUMN IF NOT EXISTS qr_code_id             UUID     NOT NULL DEFAULT gen_random_uuid();


-- ============================================================
-- 3. ALTER bookings
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS actual_start_time  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end_time    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_prebooked       BOOLEAN;


-- ============================================================
-- 4. CREATE reviews table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating       SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent a reviewer from reviewing the same booking twice
  CONSTRAINT uq_review_per_booking UNIQUE (booking_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read reviews
CREATE POLICY "reviews_select_authenticated"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only the reviewer (a party in the booking) can insert a review
CREATE POLICY "reviews_insert_own"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = booking_id
        AND (b.renter_id = auth.uid() OR l.owner_id = auth.uid())
    )
  );

-- Policy: Reviewer can update/delete their own review
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);


-- ============================================================
-- 5. CREATE messages table (ephemeral booking chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: check that the current user is a party in the booking
-- (works for both SELECT and INSERT policies)
CREATE POLICY "messages_select_booking_parties"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = booking_id
        AND (b.renter_id = auth.uid() OR l.owner_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_booking_parties"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = booking_id
        AND (b.renter_id = auth.uid() OR l.owner_id = auth.uid())
    )
  );

-- No UPDATE / DELETE on messages (ephemeral — append-only chat)


-- ============================================================
-- 6. Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id   ON public.reviews   (booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id  ON public.reviews   (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id  ON public.messages  (booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON public.messages  (created_at);
