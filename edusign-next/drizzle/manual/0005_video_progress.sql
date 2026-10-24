-- Additive: retain existing declared activities and quiz records.
alter table public.learning_events add column if not exists video_duration_ms integer;
alter table public.learning_events add column if not exists video_position_ms integer;
alter table public.learning_events add column if not exists watched_ranges jsonb;
create index if not exists learning_events_video_idx on public.learning_events(user_id, course_id, source);
-- Recorded telemetry must be written through the authenticated validation API.
-- Owners retain read access; no client can forge another learner's records.
drop policy if exists "Users manage own events" on public.learning_events;
drop policy if exists "Users read own events" on public.learning_events;
create policy "Users read own events" on public.learning_events for select using (auth.uid() = user_id);
