-- KAABE Knowledge Base V1
create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null default 'other' check (category in ('business_info','opening_hours','services','prices','faq','policy','other')),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.knowledge_items enable row level security;

drop policy if exists "knowledge_select_members" on public.knowledge_items;
create policy "knowledge_select_members" on public.knowledge_items for select using (
  exists(select 1 from public.business_members bm where bm.business_id=knowledge_items.business_id and bm.user_id=auth.uid())
  or exists(select 1 from public.businesses b where b.id=knowledge_items.business_id and b.owner_id=auth.uid())
);
drop policy if exists "knowledge_insert_members" on public.knowledge_items;
create policy "knowledge_insert_members" on public.knowledge_items for insert with check (
  exists(select 1 from public.business_members bm where bm.business_id=knowledge_items.business_id and bm.user_id=auth.uid())
  or exists(select 1 from public.businesses b where b.id=knowledge_items.business_id and b.owner_id=auth.uid())
);
drop policy if exists "knowledge_update_members" on public.knowledge_items;
create policy "knowledge_update_members" on public.knowledge_items for update using (
  exists(select 1 from public.business_members bm where bm.business_id=knowledge_items.business_id and bm.user_id=auth.uid())
  or exists(select 1 from public.businesses b where b.id=knowledge_items.business_id and b.owner_id=auth.uid())
) with check (
  exists(select 1 from public.business_members bm where bm.business_id=knowledge_items.business_id and bm.user_id=auth.uid())
  or exists(select 1 from public.businesses b where b.id=knowledge_items.business_id and b.owner_id=auth.uid())
);
drop policy if exists "knowledge_delete_members" on public.knowledge_items;
create policy "knowledge_delete_members" on public.knowledge_items for delete using (
  exists(select 1 from public.business_members bm where bm.business_id=knowledge_items.business_id and bm.user_id=auth.uid())
  or exists(select 1 from public.businesses b where b.id=knowledge_items.business_id and b.owner_id=auth.uid())
);
create index if not exists knowledge_items_business_idx on public.knowledge_items(business_id);
