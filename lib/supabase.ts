
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    // Only warn in development, but don't crash just yet as build might not have env vars
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Missing Supabase Environment Variables!');
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
