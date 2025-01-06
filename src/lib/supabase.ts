import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par celles de votre projet Supabase
// Vous pouvez les trouver dans les paramètres de votre projet Supabase
// sous "Project Settings" > "API"
const supabaseUrl = "https://[VOTRE-REFERENCE-PROJET].supabase.co";
const supabaseKey = "[VOTRE-CLE-ANON-KEY]";

export const supabase = createClient(supabaseUrl, supabaseKey);