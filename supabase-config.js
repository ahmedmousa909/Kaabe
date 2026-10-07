// KAABE Supabase browser client configuration.
// Publishable key is intended for browser use. Keep secret/service-role keys server-side only.
const KAABE_SUPABASE_URL = "https://zrjufiogyaxortzktmbh.supabase.co";
const KAABE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xUVlWrvr2wjdg9k6_efleQ_6VaqAvsx";

window.kaabeSupabase = window.supabase.createClient(
  KAABE_SUPABASE_URL,
  KAABE_SUPABASE_PUBLISHABLE_KEY
);
