import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ozkbnimjuhaweigscdby.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96a2JuaW1qdWhhd2VpZ3NjZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODc4NDYsImV4cCI6MjA2Njg2Mzg0Nn0.C4OgN-JEBX9ZqnRDXU9XmGnED2pCh3kI82GrHPXtq8U";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);