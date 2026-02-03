
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['income_idea_reviews', 'income_ideas_votes', 'user_saved_ideas', 'profiles', 'income_ideas'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(0);
        if (error) {
            console.log(`${table}: ERROR - ${error.code} - ${error.message}`);
        } else {
            console.log(`${table}: OK`);
        }
    }
}

checkTables();
