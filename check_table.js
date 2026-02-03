
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('--- Checking for income_idea_reviews table ---');
    const { data, error } = await supabase
        .from('income_idea_reviews')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        if (error.code === '42P01') {
            console.log('CONFIRMED: Table income_idea_reviews does not exist.');
        }
    } else {
        console.log('Table exists. Count:', data.length);
    }
}

checkTable();
