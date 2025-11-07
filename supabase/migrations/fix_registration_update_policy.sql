-- Fix RLS policy for organizers updating registrations
-- Issue: Missing WITH CHECK clause which is required for UPDATE operations

-- Drop existing policy
DROP POLICY IF EXISTS "Organizers can update registrations for their events" ON public.registrations;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Organizers can update registrations for their events"
  ON public.registrations FOR UPDATE
  USING (
    (SELECT auth.uid()) IN (
      SELECT organizer_id FROM public.events WHERE id = event_id
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) IN (
      SELECT organizer_id FROM public.events WHERE id = event_id
    )
  );

-- Also fix the user's own registration policy
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;

CREATE POLICY "Users can update their own registrations"
  ON public.registrations FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Organizers can update registrations for their events" ON public.registrations IS 
'Allow event organizers to update registration status (registered/attended/cancelled) for their events';

COMMENT ON POLICY "Users can update their own registrations" ON public.registrations IS 
'Allow users to update their own registration data';
