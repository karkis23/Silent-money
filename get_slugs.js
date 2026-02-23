import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxkpfcepowplnciinsps.supabase.co';
const supabaseKey = 'sb_publishable_ANLHFeacDU53K9UvqQU_uw_QZs6kj9W';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSlugs() {
    const { data: ideas, error } = await supabase
        .from('income_ideas')
        .select('title, slug')
        .or('title.ilike.%EV%,title.ilike.%Fleet%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    ideas.forEach(idea => {
        console.log(`Title: ${idea.title} | Slug: ${idea.slug}`);
    });
}

getSlugs();
