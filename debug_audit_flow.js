
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertAndFetch() {
    console.log('--- Testing Insert ---');

    // Get a valid user ID
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    if (!profile) {
        console.log('No profiles found to test with.');
        return;
    }

    const userId = profile.id;
    console.log('Using User ID:', userId);

    const testData = {
        user_id: userId,
        brand_name: 'Test Brand',
        brand_sector: 'Test Sector',
        investment_budget: '5-10L',
        status: 'pending'
    };

    const { data: insertData, error: insertError } = await supabase
        .from('expert_audit_requests')
        .insert([testData])
        .select();

    if (insertError) {
        console.error('Insert Error:', insertError);
    } else {
        console.log('Insert Success:', insertData);
    }

    console.log('\n--- Testing Fetch with Join ---');
    const { data: fetchData, error: fetchError } = await supabase
        .from('expert_audit_requests')
        .select('*, profiles(full_name)')
        .limit(1);

    if (fetchError) {
        console.error('Fetch Error:', fetchError);
    } else {
        console.log('Fetch Success:', JSON.stringify(fetchData, null, 2));
    }
}

testInsertAndFetch();
