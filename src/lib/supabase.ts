import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://frkfprrgbeyvrygzqody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZya2ZwcnJnYmV5dnJ5Z3pxb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTI0NTQsImV4cCI6MjA5MjY4ODQ1NH0.UszJjA8cdXXOajblK0fl71nSm48zDSHPGg9ysL7-0wA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);