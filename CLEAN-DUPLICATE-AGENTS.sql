-- KAABE: keep one assistant of each type per business and remove duplicate test records.
with ranked as (
  select id,
         row_number() over (
           partition by business_id, type
           order by created_at asc, id asc
         ) as rn
  from public.agents
)
delete from public.agents
where id in (select id from ranked where rn > 1);

-- Prevent duplicate assistant types from being created again at database level.
create unique index if not exists agents_one_type_per_business_idx
on public.agents (business_id, type);
