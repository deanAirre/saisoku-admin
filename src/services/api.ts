import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasepublishablekey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasepublishablekey) {
  throw new Error("Missing supabase environment variables!");
}

export const supabase = createClient(supabaseUrl, supabasepublishablekey);
