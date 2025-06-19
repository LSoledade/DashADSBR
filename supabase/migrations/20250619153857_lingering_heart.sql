/*
  # Create meta_connections table

  1. New Tables
    - `meta_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `meta_user_id` (text, Meta user ID)
      - `access_token` (text, encrypted access token)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `meta_connections` table
    - Add policies for authenticated users to manage their own connections
    - Ensure access_token is handled securely

  3. Indexes
    - Add unique constraint on user_id + meta_user_id
    - Add index for faster lookups
*/

-- Create meta_connections table
CREATE TABLE IF NOT EXISTS meta_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_user_id text NOT NULL,
  access_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one connection per user per Meta account
  UNIQUE(user_id, meta_user_id)
);

-- Enable RLS
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own meta connections"
  ON meta_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meta connections"
  ON meta_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meta connections"
  ON meta_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meta connections"
  ON meta_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all connections (for Edge Functions)
CREATE POLICY "Service role can manage all meta connections"
  ON meta_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meta_connections_user_id 
  ON meta_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_meta_connections_meta_user_id 
  ON meta_connections(meta_user_id);

-- Add trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'meta_connections_updated_at'
  ) THEN
    CREATE TRIGGER meta_connections_updated_at
      BEFORE UPDATE ON meta_connections
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;