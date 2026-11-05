-- PrimeStock schema. Apply in the Supabase SQL editor before signing in.
-- All client writes go through the functions below. Tables expose SELECT only.
create table if not exists public.ps_branches (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  city text not null default '',
  staff integer not null default 1 check (staff >= 0),
  status text not null default 'Active' check (status in ('Active','Pending','Offline')),
  created_at timestamptz not null default now()
);
create table if not exists public.ps_suppliers (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.ps_products (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  name text not null,
  sku text not null,
  category text not null default 'General',
  brand text not null default '',
  unit text not null default 'pcs',
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  price numeric(14,2) not null default 0 check (price >= 0),
  cost numeric(14,2) not null default 0 check (cost >= 0),
  icon text not null default 'cube-outline',
  tint text not null default '#E8F1FF',
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (branch_id, sku)
);
create table if not exists public.ps_intakes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  product_id text not null references public.ps_products(id),
  supplier_id text references public.ps_suppliers(id),
  batch text not null,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(14,2) not null check (unit_cost >= 0),
  date date not null default current_date,
  status text not null default 'Received',
  created_at timestamptz not null default now()
);
create table if not exists public.ps_sales (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  total numeric(14,2) not null check (total >= 0),
  cost_total numeric(14,2) not null default 0,
  date date not null default current_date,
  method text not null check (method in ('Full payment','Partial credit','Overpayment')),
  items integer not null check (items > 0),
  customer text,
  tendered numeric(14,2),
  created_at timestamptz not null default now()
);
create table if not exists public.ps_sale_lines (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_id text not null references public.ps_sales(id) on delete cascade,
  product_id text not null references public.ps_products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null,
  unit_cost numeric(14,2) not null
);
create table if not exists public.ps_debts (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  sale_id text references public.ps_sales(id),
  customer text not null,
  amount numeric(14,2) not null check (amount > 0),
  due_date date not null,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.ps_orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  product_id text not null references public.ps_products(id),
  quantity integer not null check (quantity > 0),
  cost numeric(14,2) not null,
  date date not null default current_date,
  status text not null default 'Draft',
  created_at timestamptz not null default now()
);
create table if not exists public.ps_activities (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  title text not null,
  detail text not null,
  kind text not null check (kind in ('stock','sale','alert','order')),
  created_at timestamptz not null default now()
);
create table if not exists public.ps_import_purchases (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  date date not null,
  product_id text not null references public.ps_products(id),
  quantity integer not null check (quantity > 0),
  unit_price_usd numeric(14,2) not null check (unit_price_usd > 0),
  usd_rate_etb numeric(14,2) not null check (usd_rate_etb > 0),
  freight_etb numeric(14,2) not null check (freight_etb >= 0),
  supplier text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.ps_courier_arrivals (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  date date not null,
  product_id text not null references public.ps_products(id),
  quantity integer not null check (quantity > 0),
  courier text not null,
  purchase_id text references public.ps_import_purchases(id),
  created_at timestamptz not null default now()
);
create table if not exists public.ps_bank_transfers (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id text not null references public.ps_branches(id),
  date date not null,
  amount_etb numeric(14,2) not null check (amount_etb > 0),
  bank text not null,
  usd_rate numeric(14,2) not null check (usd_rate > 0),
  aed_rate numeric(14,2) not null check (aed_rate > 0),
  remitter text not null,
  receipt_path text,
  receipt_name text,
  receipt_size integer,
  receipt_mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists ps_products_user_branch on public.ps_products(user_id, branch_id);
create index if not exists ps_sales_user_branch_date on public.ps_sales(user_id, branch_id, date);
create index if not exists ps_activities_user_branch_date on public.ps_activities(user_id, branch_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array[
    'ps_branches','ps_suppliers','ps_products','ps_intakes','ps_sales','ps_sale_lines',
    'ps_debts','ps_orders','ps_activities','ps_import_purchases',
    'ps_courier_arrivals','ps_bank_transfers'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('drop policy if exists owner_read on public.%I', t);
    execute format('create policy owner_read on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

create or replace function public.ps_bootstrap()
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_branch text;
begin
  if v_user is null then raise exception 'Sign in first'; end if;
  -- Inventory and trade can request the first workspace at the same time.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  select id into v_branch from public.ps_branches where user_id = v_user order by created_at limit 1;
  if v_branch is null then
    insert into public.ps_branches(user_id, name, city) values (v_user, 'Main branch', '')
    returning id into v_branch;
  end if;
  return v_branch;
end $$;

create or replace function public.ps_create_branch(p_name text, p_city text)
returns public.ps_branches language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_branches;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if nullif(trim(p_name), '') is null then raise exception 'Branch name is required'; end if;
  insert into public.ps_branches(user_id,name,city)
  values (auth.uid(),trim(p_name),coalesce(trim(p_city),'')) returning * into v;
  return v;
end $$;

create or replace function public.ps_create_supplier(p_name text, p_category text, p_phone text)
returns public.ps_suppliers language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_suppliers;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if nullif(trim(p_name), '') is null then raise exception 'Supplier name is required'; end if;
  insert into public.ps_suppliers(user_id,name,category,phone)
  values (auth.uid(),trim(p_name),coalesce(trim(p_category),''),coalesce(trim(p_phone),'')) returning * into v;
  return v;
end $$;

create or replace function public.ps_create_product(
  p_branch_id text, p_name text, p_sku text, p_category text, p_brand text,
  p_unit text, p_min_stock integer, p_price numeric, p_cost numeric, p_description text
) returns public.ps_products language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_products;
begin
  if not exists (select 1 from public.ps_branches where id=p_branch_id and user_id=auth.uid()) then raise exception 'Branch not found'; end if;
  if nullif(trim(p_name),'') is null or nullif(trim(p_sku),'') is null then raise exception 'Product name and SKU are required'; end if;
  insert into public.ps_products(user_id,branch_id,name,sku,category,brand,unit,min_stock,price,cost,description)
  values (auth.uid(),p_branch_id,trim(p_name),trim(p_sku),coalesce(nullif(trim(p_category),''),'General'),
    coalesce(trim(p_brand),''),coalesce(nullif(trim(p_unit),''),'pcs'),p_min_stock,p_price,p_cost,coalesce(trim(p_description),''))
  returning * into v;
  return v;
end $$;

create or replace function public.ps_receive(
  p_product_id text, p_supplier_id text, p_batch text, p_quantity integer, p_unit_cost numeric
) returns public.ps_intakes language plpgsql security definer set search_path = public, pg_temp as $$
declare v_product public.ps_products; v public.ps_intakes;
begin
  select * into v_product from public.ps_products where id=p_product_id and user_id=auth.uid() for update;
  if not found then raise exception 'Product not found'; end if;
  if p_supplier_id is not null and not exists (select 1 from public.ps_suppliers where id=p_supplier_id and user_id=auth.uid()) then raise exception 'Supplier not found'; end if;
  if p_quantity is null or p_quantity <= 0 or p_unit_cost is null or p_unit_cost < 0 or nullif(trim(p_batch),'') is null then raise exception 'Invalid intake details'; end if;
  update public.ps_products set stock=stock+p_quantity, cost=p_unit_cost where id=p_product_id;
  insert into public.ps_intakes(user_id,branch_id,product_id,supplier_id,batch,quantity,unit_cost)
  values (auth.uid(),v_product.branch_id,p_product_id,p_supplier_id,trim(p_batch),p_quantity,p_unit_cost) returning * into v;
  insert into public.ps_activities(user_id,branch_id,title,detail,kind)
  values (auth.uid(),v_product.branch_id,'New stock intake registered',v_product.name || ' · ' || p_quantity || ' ' || v_product.unit,'stock');
  return v;
end $$;

create or replace function public.ps_receive_batch(p_items jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_item jsonb; v_result jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then raise exception 'Add at least one intake item'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_result := v_result || to_jsonb(public.ps_receive(
      v_item->>'productId',v_item->>'supplierId',v_item->>'batch',
      (v_item->>'quantity')::integer,(v_item->>'unitCost')::numeric
    ));
  end loop;
  return v_result;
end $$;

create or replace function public.ps_create_order(p_product_id text, p_quantity integer)
returns public.ps_orders language plpgsql security definer set search_path = public, pg_temp as $$
declare v_product public.ps_products; v public.ps_orders;
begin
  select * into v_product from public.ps_products where id=p_product_id and user_id=auth.uid();
  if not found or p_quantity is null or p_quantity <= 0 then raise exception 'Choose a valid product and quantity'; end if;
  insert into public.ps_orders(user_id,branch_id,product_id,quantity,cost)
  values (auth.uid(),v_product.branch_id,p_product_id,p_quantity,p_quantity*v_product.cost) returning * into v;
  insert into public.ps_activities(user_id,branch_id,title,detail,kind)
  values (auth.uid(),v_product.branch_id,'Purchase order created',v_product.name || ' · ' || p_quantity || ' ' || v_product.unit,'order');
  return v;
end $$;

create or replace function public.ps_complete_sale(
  p_branch_id text, p_lines jsonb, p_method text, p_customer text, p_paid numeric, p_date date
) returns public.ps_sales language plpgsql security definer set search_path = public, pg_temp as $$
declare v_line jsonb; v_product public.ps_products; v_sale public.ps_sales;
  v_qty integer; v_total numeric := 0; v_cost numeric := 0; v_items integer := 0;
begin
  if not exists (select 1 from public.ps_branches where id=p_branch_id and user_id=auth.uid()) then raise exception 'Branch not found'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines)=0 then raise exception 'Cart is empty'; end if;
  if p_method not in ('Full payment','Partial credit','Overpayment') or p_date is null then raise exception 'Invalid payment details'; end if;
  -- Lock all requested products in a stable order to avoid concurrent overselling.
  for v_product in
    select p.* from public.ps_products p
    where p.id in (select value->>'productId' from jsonb_array_elements(p_lines))
      and p.user_id=auth.uid() and p.branch_id=p_branch_id
    order by p.id for update
  loop
    null;
  end loop;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_qty := (v_line->>'quantity')::integer;
    select * into v_product from public.ps_products
      where id=v_line->>'productId' and user_id=auth.uid() and branch_id=p_branch_id for update;
    if not found or v_qty is null or v_qty <= 0 or v_product.stock < v_qty then
      raise exception 'An item has insufficient stock';
    end if;
    v_total := v_total + v_product.price*v_qty;
    v_cost := v_cost + v_product.cost*v_qty;
    v_items := v_items + v_qty;
    update public.ps_products set stock=stock-v_qty where id=v_product.id;
  end loop;
  if p_method='Partial credit' and
     (nullif(trim(p_customer),'') is null or p_paid is null or p_paid <= 0 or p_paid >= v_total)
  then raise exception 'Enter a customer and a valid partial payment'; end if;
  if p_method='Overpayment' and (p_paid is null or p_paid <= v_total) then raise exception 'Tendered amount must exceed the total'; end if;
  insert into public.ps_sales(user_id,branch_id,total,cost_total,date,method,items,customer,tendered)
  values (auth.uid(),p_branch_id,v_total,v_cost,p_date,p_method,v_items,coalesce(nullif(trim(p_customer),''),'Walk-in customer'),
    case when p_method='Full payment' then v_total else p_paid end) returning * into v_sale;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    select * into v_product from public.ps_products where id=v_line->>'productId';
    insert into public.ps_sale_lines(user_id,sale_id,product_id,quantity,unit_price,unit_cost)
    values (auth.uid(),v_sale.id,v_product.id,(v_line->>'quantity')::integer,v_product.price,v_product.cost);
  end loop;
  if p_method='Partial credit' then
    insert into public.ps_debts(user_id,branch_id,sale_id,customer,amount,due_date)
    values (auth.uid(),p_branch_id,v_sale.id,trim(p_customer),v_total-p_paid,p_date+7);
  end if;
  insert into public.ps_activities(user_id,branch_id,title,detail,kind)
  values (auth.uid(),p_branch_id,'Sale completed',v_items || ' items · ETB ' || v_total,'sale');
  return v_sale;
end $$;

create or replace function public.ps_settle_debt(p_debt_id text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_debts;
begin
  update public.ps_debts set paid=true where id=p_debt_id and user_id=auth.uid() and paid=false returning * into v;
  if not found then raise exception 'Unpaid debt not found'; end if;
  insert into public.ps_activities(user_id,branch_id,title,detail,kind)
  values (auth.uid(),v.branch_id,'Customer payment received',v.customer || ' · ETB ' || v.amount,'sale');
end $$;

create or replace function public.ps_create_purchase(
  p_branch_id text, p_date date, p_product_id text, p_quantity integer,
  p_unit_price_usd numeric, p_usd_rate_etb numeric, p_freight_etb numeric, p_supplier text
) returns public.ps_import_purchases language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_import_purchases;
begin
  if not exists (select 1 from public.ps_products where id=p_product_id and branch_id=p_branch_id and user_id=auth.uid()) then raise exception 'Product not found'; end if;
  if p_date is null or p_quantity <= 0 or p_unit_price_usd <= 0 or p_usd_rate_etb <= 0 or p_freight_etb < 0 or nullif(trim(p_supplier),'') is null then raise exception 'Invalid import purchase'; end if;
  insert into public.ps_import_purchases(user_id,branch_id,date,product_id,quantity,unit_price_usd,usd_rate_etb,freight_etb,supplier)
  values (auth.uid(),p_branch_id,p_date,p_product_id,p_quantity,p_unit_price_usd,p_usd_rate_etb,p_freight_etb,trim(p_supplier)) returning * into v;
  return v;
end $$;

create or replace function public.ps_create_arrival(
  p_branch_id text, p_date date, p_product_id text, p_quantity integer, p_courier text, p_purchase_id text
) returns public.ps_courier_arrivals language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_courier_arrivals; v_purchase public.ps_import_purchases; v_product public.ps_products;
  v_received integer; v_cost numeric;
begin
  select * into v_product from public.ps_products where id=p_product_id and user_id=auth.uid() and branch_id=p_branch_id for update;
  if not found then raise exception 'Product not found'; end if;
  if p_date is null or p_quantity is null or p_quantity <= 0 or nullif(trim(p_courier),'') is null then raise exception 'Invalid courier arrival'; end if;
  if p_purchase_id is not null then
    select * into v_purchase from public.ps_import_purchases
      where id=p_purchase_id and user_id=auth.uid() and branch_id=p_branch_id and product_id=p_product_id for update;
    if not found then raise exception 'Linked purchase not found'; end if;
    select coalesce(sum(quantity),0) into v_received from public.ps_courier_arrivals where purchase_id=p_purchase_id;
    if v_received+p_quantity > v_purchase.quantity then raise exception 'Arrival exceeds remaining purchase quantity'; end if;
    v_cost := v_purchase.unit_price_usd*v_purchase.usd_rate_etb+v_purchase.freight_etb;
  else v_cost := v_product.cost;
  end if;
  insert into public.ps_courier_arrivals(user_id,branch_id,date,product_id,quantity,courier,purchase_id)
  values (auth.uid(),p_branch_id,p_date,p_product_id,p_quantity,trim(p_courier),p_purchase_id) returning * into v;
  update public.ps_products set stock=stock+p_quantity,cost=v_cost where id=p_product_id;
  insert into public.ps_intakes(user_id,branch_id,product_id,batch,quantity,unit_cost,date)
  values (auth.uid(),p_branch_id,p_product_id,v.id,p_quantity,v_cost,p_date);
  insert into public.ps_activities(user_id,branch_id,title,detail,kind)
  values (auth.uid(),p_branch_id,'Courier arrival received',v_product.name || ' · ' || p_quantity || ' ' || v_product.unit,'stock');
  return v;
end $$;

create or replace function public.ps_create_transfer(
  p_branch_id text, p_date date, p_amount_etb numeric, p_bank text, p_usd_rate numeric,
  p_aed_rate numeric, p_remitter text, p_receipt_path text, p_receipt_name text,
  p_receipt_size integer, p_receipt_mime_type text
) returns public.ps_bank_transfers language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.ps_bank_transfers;
begin
  if not exists (select 1 from public.ps_branches where id=p_branch_id and user_id=auth.uid()) then raise exception 'Branch not found'; end if;
  if p_date is null or p_amount_etb <= 0 or p_usd_rate <= 0 or p_aed_rate <= 0 or nullif(trim(p_bank),'') is null or nullif(trim(p_remitter),'') is null then raise exception 'Invalid transfer'; end if;
  if p_receipt_path is not null and (split_part(p_receipt_path,'/',1) <> auth.uid()::text or p_receipt_size > 10485760) then raise exception 'Invalid receipt'; end if;
  insert into public.ps_bank_transfers(user_id,branch_id,date,amount_etb,bank,usd_rate,aed_rate,remitter,receipt_path,receipt_name,receipt_size,receipt_mime_type)
  values (auth.uid(),p_branch_id,p_date,p_amount_etb,trim(p_bank),p_usd_rate,p_aed_rate,trim(p_remitter),p_receipt_path,p_receipt_name,p_receipt_size,p_receipt_mime_type) returning * into v;
  return v;
end $$;

create or replace function public.ps_sales_summary(p_branch_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v jsonb;
begin
  if not exists (select 1 from public.ps_branches where id=p_branch_id and user_id=auth.uid()) then raise exception 'Branch not found'; end if;
  select jsonb_build_object(
    'Daily', jsonb_build_object(
      'revenue',coalesce(sum(total) filter (where date=current_date),0),
      'cost',coalesce(sum(cost_total) filter (where date=current_date),0)),
    'Weekly', jsonb_build_object(
      'revenue',coalesce(sum(total) filter (where date between date_trunc('week',current_date)::date and current_date),0),
      'cost',coalesce(sum(cost_total) filter (where date between date_trunc('week',current_date)::date and current_date),0)),
    'Monthly', jsonb_build_object(
      'revenue',coalesce(sum(total) filter (where date between date_trunc('month',current_date)::date and current_date),0),
      'cost',coalesce(sum(cost_total) filter (where date between date_trunc('month',current_date)::date and current_date),0)),
    'Annual', jsonb_build_object(
      'revenue',coalesce(sum(total) filter (where date between date_trunc('year',current_date)::date and current_date),0),
      'cost',coalesce(sum(cost_total) filter (where date between date_trunc('year',current_date)::date and current_date),0))
  ) into v from public.ps_sales where user_id=auth.uid() and branch_id=p_branch_id;
  return v;
end $$;

do $$
declare fn text;
begin
  foreach fn in array array[
    'ps_bootstrap','ps_create_branch','ps_create_supplier','ps_create_product','ps_receive','ps_receive_batch',
    'ps_create_order','ps_complete_sale','ps_settle_debt','ps_create_purchase',
    'ps_create_arrival','ps_create_transfer','ps_sales_summary'
  ] loop
    execute format('revoke all on function public.%I from public, anon', fn);
    execute format('grant execute on function public.%I to authenticated', fn);
  end loop;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ps-receipts','ps-receipts',false,10485760,array['application/pdf','image/*'])
on conflict (id) do update set public=false,file_size_limit=10485760,
  allowed_mime_types=array['application/pdf','image/*'];
drop policy if exists ps_receipts_read on storage.objects;
drop policy if exists ps_receipts_insert on storage.objects;
drop policy if exists ps_receipts_delete on storage.objects;
create policy ps_receipts_read on storage.objects for select to authenticated
  using (bucket_id='ps-receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy ps_receipts_insert on storage.objects for insert to authenticated
  with check (bucket_id='ps-receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy ps_receipts_delete on storage.objects for delete to authenticated
  using (bucket_id='ps-receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
