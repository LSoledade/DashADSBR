/*
  # Create ad_accounts_cache table

  1. New Tables
    - `ad_accounts_cache`
      - `id` (uuid, primary key)
      - `connection_id` (uuid, foreign key to meta_connections)
      - `meta_ad_account_id` (text, Meta ad account ID)
      - `name` (text, account name)
      - `is_active` (boolean, whether account is still accessible)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ad_accounts_cache` table
    - Add policies for users to access their cached ad accounts
    - Ensure users can only see accounts from their own connections

  3. Indexes
    - Add unique constraint on connection_id + meta_ad_account_id
    - Add indexes for faster lookups
*/

-- Create ad_accounts_cache table
CREATE TABLE IF NOT EXISTS ad_accounts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES meta_connections(id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one cache entry per connection per ad account
  UNIQUE(connection_id, meta_ad_account_id)
);

-- Enable RLS
ALTER TABLE ad_accounts_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their cached ad accounts"
  ON ad_accounts_cache
  FOR SELECT
  TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM meta_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their cached ad accounts"
  ON ad_accounts_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (
    connection_id IN (
      SELECT id FROM meta_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their cached ad accounts"
  ON ad_accounts_cache
  FOR UPDATE
  TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM meta_connections WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM meta_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their cached ad accounts"
  ON ad_accounts_cache
  FOR DELETE
  TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM meta_connections WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all cached ad accounts (for Edge Functions)
CREATE POLICY "Service role can manage all ad accounts cache"
  ON ad_accounts_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_accounts_cache_connection_id 
  ON ad_accounts_cache(connection_id);

CREATE INDEX IF NOT EXISTS idx_ad_accounts_cache_meta_id 
  ON ad_accounts_cache(meta_ad_account_id);

CREATE INDEX IF NOT EXISTS idx_ad_accounts_cache_active 
  ON ad_accounts_cache(is_active);

-- Add trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ad_accounts_cache_updated_at'
  ) THEN
    CREATE TRIGGER ad_accounts_cache_updated_at
      BEFORE UPDATE ON ad_accounts_cache
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;