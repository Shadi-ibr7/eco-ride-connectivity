import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jjkqstovmeudbwisqhmo.supabase.co";
const supabaseKey = "rmso+FZFBSgT5tZV2nKpiTXd+Rup1I2wkauTCT7DUAtVW/f7kROrdlwXW3dWlnJ2ZiJYDhtjU0d88loocxJVKg==";

export const supabase = createClient(supabaseUrl, supabaseKey);