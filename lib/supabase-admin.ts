import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

// Falls back to anon key so local dev still works even without service role key set.
// Production should always have SUPABASE_SERVICE_ROLE_KEY set for server-side queries
// that need to bypass RLS (e.g. resolving staff profiles from medication records).
const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) {
    throw new Error("Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)");
}

const supabaseAdmin = createClient(supabaseUrl, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export default supabaseAdmin;
