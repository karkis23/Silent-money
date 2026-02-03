
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    try {
        console.log('Checking income_ideas columns...');
        const { data: ideaData, error: ideaError } = await supabase.from('income_ideas').select('*').limit(1);
        if (ideaError) console.error('Error fetching ideas:', ideaError);
        else console.log('Idea columns:', Object.keys(ideaData[0] || {}));

        console.log('\nChecking franchises columns...');
        const { data: franData, error: franError } = await supabase.from('franchises').select('*').limit(1);
        if (franError) console.error('Error fetching franchises:', franError);
        else console.log('Franchise columns:', Object.keys(franData[0] || {}));

        console.log('\nChecking profiles columns...');
        const { data: profData, error: profError } = await supabase.from('profiles').select('*').limit(1);
        if (profError) console.error('Error fetching profiles:', profError);
        else console.log('Profile columns:', Object.keys(profData[0] || {}));
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

checkColumns();
