import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxkpfcepowplnciinsps.supabase.co';
const supabaseKey = 'sb_publishable_ANLHFeacDU53K9UvqQU_uw_QZs6kj9W';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
    const { data, error } = await supabase
        .from('franchises')
        .select('slug, name, image_url');

    if (error) {
        console.error(error);
        return;
    }

    console.log('Total franchises:', data.length);
    data.forEach(f => {
        console.log(`Slug: "${f.slug}" | Name: "${f.name}" | Image: ${f.image_url ? 'EXISTS' : 'NULL'}`);
    });
}

checkSlugs();
