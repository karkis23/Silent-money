export const createAdminLogsTable = `
  create table if not exists admin_logs (
    id uuid default uuid_generate_v4() primary key,
    admin_id uuid references auth.users not null,
    action_type text not null, -- 'approve', 'reject', 'ban', 'delete', 'feature'
    target_type text not null, -- 'idea', 'franchise', 'user'
    target_id uuid, -- using uuid for flexibility, though not strictly referenced if target deleted
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  alter table admin_logs enable row level security;

  create policy "Admins can view all logs"
    on admin_logs for select
    using (auth.uid() in (select id from profiles where is_admin = true));

  create policy "Admins can insert logs"
    on admin_logs for insert
    with check (auth.uid() in (select id from profiles where is_admin = true));
`;

export const addFeaturedColumn = `
  alter table income_ideas add column if not exists is_featured boolean default false;
  alter table franchises add column if not exists is_featured boolean default false;
`;

export const addBannedColumn = `
  alter table profiles add column if not exists is_banned boolean default false;
`;

export const createCategoriesTable = `
  create table if not exists categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    slug text not null unique,
    type text not null, -- 'idea' or 'franchise'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  alter table categories enable row level security;
  
  create policy "Everyone can read categories"
    on categories for select
    using (true);

  create policy "Admins can manage categories"
    on categories for all
    using (auth.uid() in (select id from profiles where is_admin = true));
`;
