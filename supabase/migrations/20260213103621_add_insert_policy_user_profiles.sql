/*
  # Add INSERT Policy for User Profiles

  1. New Policy
    - Allow authenticated users to create their own profile
    - This is needed when a user signs up and the profile creation happens from the frontend

  2. Security
    - Users can only insert their own profile (id = auth.uid())
    - This prevents users from creating profiles for other users
*/

-- Add policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
