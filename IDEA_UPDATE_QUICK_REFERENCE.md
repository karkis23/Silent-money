# Quick Reference: Key Data Points Needed for Each Idea

## Essential Fields (Must Have)

### 1. Financial Data
- **Initial Investment Min**: ₹[amount]
- **Initial Investment Max**: ₹[amount]
- **Monthly Income Min**: ₹[amount]
- **Monthly Income Max**: ₹[amount]
- **Time to First Income**: [days]

### 2. Effort & Risk
- **Effort Level**: passive | semi-passive | active
- **Time Commitment**: [hours/week]
- **Risk Level**: low | medium | high
- **Success Rate**: [0-100]%

### 3. Content
- **Title**: [60 chars max]
- **Short Description**: [150-200 chars]
- **Full Description**: [500-1500 words, Markdown]
- **Reality Check**: [300-500 words, honest assessment]

### 4. Requirements
- **Skills Required**: [Array of skills]
- **Is India Specific**: true | false

### 5. Metadata
- **Category ID**: [UUID from categories table]
- **Is Featured**: true | false
- **Is Premium**: true | false

---

## Research Priority Order

1. **Financial Metrics** ← Start here (most important)
2. **Reality Check** ← Second priority (builds trust)
3. **Full Description** ← Third (provides value)
4. **Skills & Requirements** ← Fourth (helps filtering)
5. **SEO & Metadata** ← Last (optimization)

---

## Where to Find Real Data

### Financial Information
- **Investment costs**: 
  - Tool websites (pricing pages)
  - Freelancer marketplaces (Upwork, Fiverr rates)
  - Industry reports (IBEF, Statista)
  
- **Income potential**:
  - Case studies on YouTube (verify with multiple sources)
  - Reddit communities (r/IndianStockMarket, r/passive_income)
  - Industry benchmarks (Google "average earnings [business type] India")

### Success Rates & Risk
- **Industry reports**: MSME reports, startup failure rates
- **Surveys**: YourStory, Inc42 startup reports
- **Realistic estimate**: If no data, use 20-40% for most businesses

### Skills & Time
- **Job postings**: See what employers require
- **Course syllabi**: Check Udemy, Coursera for learning time
- **Practitioner interviews**: Ask people doing it

---

## Quick Update SQL Template

```sql
UPDATE income_ideas
SET
  initial_investment_min = [amount],
  initial_investment_max = [amount],
  monthly_income_min = [amount],
  monthly_income_max = [amount],
  time_to_first_income_days = [days],
  effort_level = '[passive|semi-passive|active]',
  time_commitment_hours_per_week = [hours],
  risk_level = '[low|medium|high]',
  success_rate_percentage = [0-100],
  reality_check = '[your honest assessment]',
  full_description = '[comprehensive guide]',
  skills_required = ARRAY['skill1', 'skill2', 'skill3'],
  is_india_specific = [true|false],
  is_featured = [true|false],
  updated_at = NOW()
WHERE slug = '[idea-slug]';
```

---

## Validation Checklist

Before marking an idea as "updated":

✅ All financial numbers are realistic (not inflated)
✅ Reality Check mentions at least 3 challenges
✅ Full Description has actionable steps
✅ Skills list is accurate (not oversimplified)
✅ Success rate is honest (not 90%+)
✅ Time to first income is realistic (not "7 days")
✅ Verified with at least 2 independent sources
