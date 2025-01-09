import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par celles de votre projet Supabase
// Vous pouvez les trouver dans les paramètres de votre projet Supabase
// sous "Project Settings" > "API"
const supabaseUrl = "https://example.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example";

export const supabase = createClient(supabaseUrl, supabaseKey);