import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jjkqstovmeudbwisqhmo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqa3FzdG92bWV1ZGJ3aXNxaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MjY0MDAsImV4cCI6MjAyMzUwMjQwMH0.qWXu3VxsDLGLx1hrJCJGWZGqbGYwGZNhp7dZMSOBJqY";

export const supabase = createClient(supabaseUrl, supabaseKey);