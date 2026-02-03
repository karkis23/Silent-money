
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

async function checkAuditRequests() {
    console.log('--- Checking Expert Audit Requests ---');
    const { data, count, error } = await supabase
        .from('expert_audit_requests')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching audit requests:', error);
    } else {
        console.log(`Found ${count || 0} requests.`);
        console.log('Data sample:', JSON.stringify(data, null, 2));
    }

    console.log('\n--- Checking Current Admin Profile ---');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current User ID (from env/auth):', user?.id || 'Not logged in');

    // Note: The service key or anon key might not have admin rights if RLS is on,
    // but usually anon key follows RLS. 
}

checkAuditRequests();
