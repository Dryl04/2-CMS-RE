/*
  # Allow anonymous users to read active global HF settings

  ## Problem
  The existing SELECT policy on global_hf_settings is restricted to `authenticated`
  users only. When a real mobile device (or any unauthenticated visitor) loads a
  published page, the Supabase query in SEOPageViewer returns nothing because RLS
  blocks the anon role. As a result, globalHFSetting stays null and the global
  Header & Footer are never injected.

  ## Solution
  Add a SELECT policy for the `anon` role that allows reading settings where
  is_active = true. Write operations (INSERT/UPDATE/DELETE) remain restricted
  to authenticated users with the appropriate roles.

  ## Security Notes
  - Read-only: anon users can only SELECT, never INSERT/UPDATE/DELETE
  - Filtered: only active configurations are visible (WHERE is_active = true)
  - The data exposed is purely visual configuration (widget JSON), not personal data
*/

CREATE POLICY "Anon can read active global hf settings"
  ON global_hf_settings FOR SELECT
  TO anon
  USING (is_active = true);
