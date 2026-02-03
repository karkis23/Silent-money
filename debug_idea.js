
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIdea() {
    const { data, error } = await supabase
        .from('income_ideas')
        .select('*')
        .eq('slug', 'ev-fleet-charging')
        .single();

    if (error) {
        console.error('Error fetching idea:', error);
    } else {
        console.log('Idea Data:', JSON.stringify(data, null, 2));
    }
}

checkIdea();
