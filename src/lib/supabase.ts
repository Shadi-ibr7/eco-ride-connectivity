import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jjkqstovmeudbwisqhmo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqa3FzdG92bWV1ZGJ3aXNxaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0ODY0MDAsImV4cCI6MjAyMzA2MjQwMH0.rmso+FZFBSgT5tZV2nKpiTXd+Rup1I2wkauTCT7DUAtVW/f7kROrdlwXW3dWlnJ2ZiJYDhtjU0d88loocxJVKg";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});