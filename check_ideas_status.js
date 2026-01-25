import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxkpfcepowplnciinsps.supabase.co';
const supabaseKey = 'sb_publishable_ANLHFeacDU53K9UvqQU_uw_QZs6kj9W';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndReportStatus() {
    console.log('🔍 Analyzing all income ideas in database...\n');

    const { data: ideas, error } = await supabase
        .from('income_ideas')
        .select('id, slug, title, full_description, reality_check, skills_required, initial_investment_max, monthly_income_max, time_to_first_income_days, success_rate_percentage');

    if (error) {
        console.error('❌ Error fetching ideas:', error);
        return;
    }

    const total = ideas.length;
    const fullyEnriched = ideas.filter(idea =>
        idea.full_description &&
        idea.reality_check &&
        idea.skills_required &&
        idea.initial_investment_max &&
        idea.monthly_income_max &&
        idea.time_to_first_income_days &&
        idea.success_rate_percentage
    );

    const partiallyEnriched = ideas.filter(idea =>
        (idea.full_description || idea.reality_check) &&
        !(idea.full_description && idea.reality_check && idea.skills_required && idea.initial_investment_max)
    );

    const notEnriched = ideas.filter(idea =>
        !idea.full_description && !idea.reality_check
    );

    console.log('📊 DATABASE STATUS REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Ideas: ${total}`);
    console.log(`✅ Fully Enriched: ${fullyEnriched.length} (${((fullyEnriched.length / total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Partially Enriched: ${partiallyEnriched.length}`);
    console.log(`❌ Not Enriched: ${notEnriched.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (notEnriched.length > 0) {
        console.log('🚨 Ideas Missing Data (showing first 10):');
        notEnriched.slice(0, 10).forEach((idea, i) => {
            console.log(`${i + 1}. ${idea.title} (${idea.slug})`);
        });
        console.log('');
    }

    if (partiallyEnriched.length > 0) {
        console.log('⚠️  Partially Enriched Ideas (showing first 5):');
        partiallyEnriched.slice(0, 5).forEach((idea, i) => {
            const missing = [];
            if (!idea.full_description) missing.push('full_description');
            if (!idea.reality_check) missing.push('reality_check');
            if (!idea.skills_required) missing.push('skills_required');
            if (!idea.initial_investment_max) missing.push('investment_max');
            console.log(`${i + 1}. ${idea.title} - Missing: ${missing.join(', ')}`);
        });
        console.log('');
    }

    console.log('\n💡 RECOMMENDATION:');
    if (fullyEnriched.length === total) {
        console.log('✅ All ideas are fully enriched! Your platform is ready.');
    } else {
        console.log('📝 Run the MASTER_DATABASE_SYNC_2025.sql file in Supabase SQL Editor to enrich all ideas.');
        console.log('   File location: supabase/MASTER_DATABASE_SYNC_2025.sql');
        console.log(`\n   Quick Link: https://supabase.com/dashboard/project/kxkpfcepowplnciinsps/sql/new`);
    }
}

checkAndReportStatus().catch(console.error);
