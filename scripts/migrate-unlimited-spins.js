// Usage: node scripts/migrate-unlimited-spins.js "<DATABASE_URL>"   (or set DATABASE_URL)
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) { console.error("Pass the database URL as an argument or set DATABASE_URL."); process.exit(1); }

(async () => {
  const ssl = /sslmode=require|neon\.tech|supabase|vercel-storage|amazonaws/.test(url) ? { rejectUnauthorized: false } : undefined;
  const client = new Client({ connectionString: url, ssl });
  await client.connect();
  await client.query(fs.readFileSync(path.join(__dirname, "unlimited-spins.sql"), "utf8"));
  const { rows } = await client.query(
    "select indexname, indexdef like '%UNIQUE%' as is_unique from pg_indexes where schemaname='public' and tablename in ('spin_entries','user_accounts') order by indexname"
  );
  console.table(rows);
  await client.end();
  console.log("Done — unlimited spins enabled in the database.");
})().catch((e) => { console.error("Migration failed:", e.message); process.exit(1); });
