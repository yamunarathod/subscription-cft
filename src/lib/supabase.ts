import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sgwphlqtwavzcsqlaerc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnd3BobHF0d2F2emNzcWxhZXJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwMTk1MywiZXhwIjoyMDc0Mzc3OTUzfQ.HIAy4tU5k8a1O10LheQ3sxjczXBB4RtLpWTfO4XAgFc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);