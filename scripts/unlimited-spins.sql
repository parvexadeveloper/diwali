-- Allow unlimited spins: replace the one-spin-per-browser / per-Instagram / per-account-handle
-- unique indexes with normal (non-unique) indexes. Safe to run more than once.
BEGIN;
DROP INDEX IF EXISTS spin_session_unique;
DROP INDEX IF EXISTS spin_instagram_unique;
DROP INDEX IF EXISTS user_instagram_unique;
CREATE INDEX IF NOT EXISTS spin_session_idx   ON spin_entries (session_id);
CREATE INDEX IF NOT EXISTS spin_instagram_idx ON spin_entries (instagram_handle);
CREATE INDEX IF NOT EXISTS user_instagram_idx ON user_accounts (instagram_handle);
COMMIT;
