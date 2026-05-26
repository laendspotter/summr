-- summr supabase schema
-- dieses file NICHT ins repo pushen — nur lokal zum setup nutzen

-- profiles tabelle
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  name text,
  bio text,
  avatar_url text,
  location_radius int default 20,
  avg_rating numeric(3,1) default 0,
  rating_count int default 0,
  created_at timestamptz default now()
);

-- activities tabelle
create table if not exists activities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text not null,
  location_lat float,
  location_lng float,
  datetime timestamptz not null,
  max_people int not null default 5,
  creator_id uuid references auth.users(id),
  creator_name text,
  creator_avatar text,
  category text default 'sonstiges',
  created_at timestamptz default now()
);

-- participants tabelle
create table if not exists participants (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_name text,
  joined_at timestamptz default now(),
  unique(activity_id, user_id)
);

-- messages tabelle
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_name text,
  user_avatar text,
  content text not null,
  created_at timestamptz default now()
);

-- ratings tabelle
create table if not exists ratings (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id),
  from_user_id uuid references auth.users(id),
  to_user_id uuid references auth.users(id),
  from_user_name text,
  stars int check (stars between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(activity_id, from_user_id, to_user_id)
);

-- RLS policies
alter table profiles enable row level security;
alter table activities enable row level security;
alter table participants enable row level security;
alter table messages enable row level security;
alter table ratings enable row level security;

-- profiles: jeder kann lesen, nur eigenes bearbeiten
create policy "profiles lesbar" on profiles for select using (true);
create policy "eigenes profil bearbeitbar" on profiles for all using (auth.uid() = id);

-- activities: jeder kann lesen, angemeldete können erstellen
create policy "activities lesbar" on activities for select using (true);
create policy "activities erstellbar" on activities for insert with check (auth.uid() = creator_id);
create policy "eigene activities bearbeitbar" on activities for update using (auth.uid() = creator_id);
create policy "eigene activities löschbar" on activities for delete using (auth.uid() = creator_id);

-- participants: jeder kann lesen, angemeldete können beitreten/verlassen
create policy "participants lesbar" on participants for select using (true);
create policy "participants erstellbar" on participants for insert with check (auth.uid() = user_id);
create policy "eigene teilnahme löschbar" on participants for delete using (auth.uid() = user_id);

-- messages: nur teilnehmer können lesen und schreiben
create policy "messages lesbar" on messages for select using (true);
create policy "messages erstellbar" on messages for insert with check (auth.uid() = user_id);

-- ratings: jeder kann lesen, angemeldete können bewerten
create policy "ratings lesbar" on ratings for select using (true);
create policy "ratings erstellbar" on ratings for insert with check (auth.uid() = from_user_id);

-- realtime für messages und participants aktivieren
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table participants;
