
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResources() {
    console.log('--- Checking Idea ---');
    const { data: idea, error: ideaError } = await supabase
        .from('income_ideas')
        .select('*')
        .eq('slug', 'ev-fleet-charging')
        .single();

    if (ideaError) {
        console.error('Error fetching idea:', ideaError);
    } else {
        console.log('Idea:', JSON.stringify(idea, null, 2));
    }

    console.log('\n--- Checking Reviews Table Policies ---');
    const { data: policies, error: polError } = await supabase
        .rpc('get_policies', { table_name: 'income_idea_reviews' });

    // Note: get_policies might not exist, but let's try a direct query on pg_policies if we had access.
    // Since we don't, we'll try to insert a test review (anonymous or fake uuid) to see the error.

    console.log('\n--- Trying test insert ---');
    const fakeUserId = '00000000-0000-0000-0000-000000000000'; // Likely to fail FK
    const { error: insertError } = await supabase
        .from('income_idea_reviews')
        .insert([{
            user_id: fakeUserId,
            idea_id: idea?.id,
            rating: 5,
            content: 'Test content'
        }]);

    if (insertError) {
        console.log('Insert Error (Expected):', insertError.code, insertError.message);
        if (insertError.code === '42501') {
            console.log('Likely RLS issue (Permission Denied)');
        } else if (insertError.code === '23503') {
            console.log('Likely Foreign Key issue (User/Idea not found)');
        }
    } else {
        console.log('Test insert succeeded! (Unexpectedly)');
    }
}

checkResources();
