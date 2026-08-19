import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fiyzxhmtptozexakldxr.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeXp4aG10cHRvemV4YWtsZHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDkzNTksImV4cCI6MjEwMDEyNTM1OX0.8bmzve7OpnXwb3mg_rDP0U_GAgVU53aCHlMg5PVZIVQ";

const TARGET_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  "7a1a7e374d4647fc718b303413faf07b0305b56c76a93855ed4eabb2a691d708";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);

      // Inject admin authentication header dynamically if logged in
      if (typeof window !== "undefined") {
        const authStatus =
          localStorage.getItem("ctf_admin_authenticated") ||
          sessionStorage.getItem("ctf_admin_authenticated");

        if (authStatus === "true") {
          headers.set("x-admin-password", TARGET_HASH);
        }
      }

      return fetch(url, { ...options, headers });
    },
  },
});
