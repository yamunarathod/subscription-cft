import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ozwvxxubkseztcakoobv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3Z4eHVia3NlenRjYWtvb2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTc3NTgsImV4cCI6MjA1NDI5Mzc1OH0.jVZtbMUn0fuQzprp-AP0Evz03v_6Zxq2s2RFEp8UlSk";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);