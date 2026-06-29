import { createClient } from "@supabase/supabase-js";

let supabase = null;

export const useSupabase = () => {
  const config = useRuntimeConfig();

  if (!supabase) {
    supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    );
  }

  return supabase;
};