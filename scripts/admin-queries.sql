-- ============================================================
-- Diwali Spin & Win — Admin panel SQL
-- ============================================================
-- The admin panel at /admin reads the EXISTING tables
-- (spin_entries, user_accounts, shipping_addresses). No schema
-- change is required. Admin login is handled in the app
-- (username "es", password "es@2312" by default, overridable with
-- the ADMIN_USERNAME / ADMIN_PASSWORD environment variables), so
-- there is no admin table to create.
--
-- The queries below are the SQL equivalents of what
-- src/app/api/admin/data/route.ts returns — handy for running the
-- same reports directly in psql / any SQL client.
-- ============================================================

-- 1) Dashboard stat cards -----------------------------------
-- Total spins
SELECT COUNT(*) AS total_spins FROM spin_entries;

-- Winners (every spin currently wins a physical prize; "none" would be a loss)
SELECT COUNT(*) AS winners FROM spin_entries WHERE prize_type <> 'none';

-- Registered players
SELECT COUNT(*) AS players FROM user_accounts;

-- Delivery addresses / orders captured
SELECT COUNT(*) AS orders FROM shipping_addresses;

-- 2) Players tab --------------------------------------------
-- One row per registered player with their prize, delivery
-- address and how many friends played via their referral link.
SELECT
  u.created_at,
  u.instagram_handle                AS username,
  u.email,
  u.referral_code,
  s.prize_id,
  s.prize_name,
  s.prize_type,
  a.full_name,
  a.phone,
  a.address_line1,
  a.address_line2,
  a.city,
  a.state,
  a.postal_code,
  a.country,
  u.share_count,
  u.order_confirmed,
  u.order_status,
  (SELECT COUNT(*) FROM spin_entries f WHERE f.referred_by_user_id = u.id) AS friends_played
FROM user_accounts u
LEFT JOIN spin_entries      s ON s.id = u.spin_entry_id
LEFT JOIN shipping_addresses a ON a.spin_entry_id = u.spin_entry_id
ORDER BY u.created_at DESC;

-- 3) All spins tab ------------------------------------------
-- Every spin ever played (newest first), with the winning prize.
SELECT
  e.created_at,
  e.instagram_handle AS username,
  e.prize_id,
  e.prize_name,
  e.prize_type
FROM spin_entries e
ORDER BY e.created_at DESC;

-- 4) Winners with a delivery address ready (optional report) -
SELECT
  u.instagram_handle AS username,
  s.prize_name,
  a.full_name,
  a.city,
  a.state,
  a.postal_code,
  (SELECT COUNT(*) FROM spin_entries f WHERE f.referred_by_user_id = u.id) AS friends_played
FROM user_accounts u
JOIN spin_entries       s ON s.id = u.spin_entry_id AND s.prize_type <> 'none'
JOIN shipping_addresses a ON a.spin_entry_id = u.spin_entry_id
ORDER BY friends_played DESC, u.created_at DESC;
