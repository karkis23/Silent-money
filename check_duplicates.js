import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxkpfcepowplnciinsps.supabase.co';
const supabaseKey = 'sb_publishable_ANLHFeacDU53K9UvqQU_uw_QZs6kj9W';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    const { data, error } = await supabase
        .from('franchises')
        .select('id, name, slug, image_url');

    if (error) {
        console.error(error);
        return;
    }

    const counts = {};
    data.forEach(f => {
        counts[f.name] = (counts[f.name] || 0) + 1;
    });

    console.log('--- Duplicates ---');
    Object.entries(counts).filter(([name, count]) => count > 1).forEach(([name, count]) => {
        console.log(`Name: ${name} | Count: ${count}`);
        const matches = data.filter(f => f.name === name);
        matches.forEach(m => {
            console.log(`  - ID: ${m.id} | Slug: ${m.slug} | Image: ${m.image_url ? 'YES' : 'NO'}`);
        });
    });
}

checkDuplicates();
