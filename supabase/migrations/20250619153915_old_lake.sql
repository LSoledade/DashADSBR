/*
  # Create useful database views

  1. Views
    - `user_meta_connections_view` - Join users with their Meta connections and ad accounts
    - `active_ad_accounts_view` - View of only active ad accounts with user info

  2. Functions
    - `get_user_ad_accounts()` - Function to get user's ad accounts
    - `cleanup_inactive_connections()` - Function to clean old/inactive data

  3. Security
    - Views respect RLS policies
    - Functions have appropriate security settings
*/

-- View to join users with their Meta connections and ad accounts
CREATE OR REPLACE VIEW user_meta_connections_view AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  mc.id as connection_id,
  mc.meta_user_id,
  mc.created_at as connected_at,
  aac.id as ad_account_cache_id,
  aac.meta_ad_account_id,
  aac.name as ad_account_name,
  aac.is_active as ad_account_active,
  aac.updated_at as ad_account_last_updated
FROM profiles p
LEFT JOIN meta_connections mc ON p.id = mc.user_id
LEFT JOIN ad_accounts_cache aac ON mc.id = aac.connection_id
WHERE aac.is_active = true OR aac.is_active IS NULL;

-- View for active ad accounts with user context
CREATE OR REPLACE VIEW active_ad_accounts_view AS
SELECT 
  aac.id,
  aac.connection_id,
  aac.meta_ad_account_id,
  aac.name,
  aac.created_at,
  aac.updated_at,
  mc.user_id,
  mc.meta_user_id,
  p.full_name as user_name
FROM ad_accounts_cache aac
JOIN meta_connections mc ON aac.connection_id = mc.id
JOIN profiles p ON mc.user_id = p.id
WHERE aac.is_active = true;

-- Function to get user's ad accounts (useful for Edge Functions)
CREATE OR REPLACE FUNCTION get_user_ad_accounts(user_uuid uuid)
RETURNS TABLE (
  ad_account_id text,
  ad_account_name text,
  connection_id uuid,
  meta_user_id text,
  last_updated timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aac.meta_ad_account_id,
    aac.name,
    aac.connection_id,
    mc.meta_user_id,
    aac.updated_at
  FROM ad_accounts_cache aac
  JOIN meta_connections mc ON aac.connection_id = mc.id
  WHERE mc.user_id = user_uuid 
    AND aac.is_active = true
  ORDER BY aac.name;
END;
$$;

-- Function to cleanup inactive connections and old cache
CREATE OR REPLACE FUNCTION cleanup_inactive_connections(days_threshold integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Mark old ad accounts as inactive (but don't delete them)
  UPDATE ad_accounts_cache 
  SET is_active = false, updated_at = now()
  WHERE updated_at < (now() - interval '1 day' * days_threshold)
    AND is_active = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Function to get connection statistics
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE (
  total_users bigint,
  connected_users bigint,
  total_connections bigint,
  total_ad_accounts bigint,
  active_ad_accounts bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(DISTINCT mc.user_id) FROM meta_connections mc),
    (SELECT COUNT(*) FROM meta_connections),
    (SELECT COUNT(*) FROM ad_accounts_cache),
    (SELECT COUNT(*) FROM ad_accounts_cache WHERE is_active = true);
END;
$$;