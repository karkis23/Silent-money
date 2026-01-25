import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxkpfcepowplnciinsps.supabase.co';
const supabaseKey = 'sb_publishable_ANLHFeacDU53K9UvqQU_uw_QZs6kj9W';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecifics() {
    const names = ["Domino's Pizza", "KFC India", "McDonald's India"];
    const { data, error } = await supabase
        .from('franchises')
        .select('name, slug, image_url')
        .in('name', names);

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(f => {
        console.log(`Name: ${f.name} | Slug: ${f.slug} | Image: ${f.image_url ? 'YES' : 'NO'}`);
    });
}

checkSpecifics();
