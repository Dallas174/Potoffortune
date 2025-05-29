// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project URL and anon key
const SUPABASE_URL = 'https://ekbzhkkpjsoounsndlyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYnpoa2twanNvb3Vuc25kbHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI0ODYsImV4cCI6MjA2NDAxODQ4Nn0.uWWDT7v3Dp9gJis7CsFBVJP0mz3XfNVkSb7yFwID6Mc';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
