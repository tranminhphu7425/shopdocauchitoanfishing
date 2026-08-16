import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fiyzxhmtptozexakldxr.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeXp4aG10cHRvemV4YWtsZHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDkzNTksImV4cCI6MjEwMDEyNTM1OX0.8bmzve7OpnXwb3mg_rDP0U_GAgVU53aCHlMg5PVZIVQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
