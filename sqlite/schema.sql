create table if not exists analyses (
  id text primary key,
  user_id text,
  job_description text not null check (length(trim(job_description)) > 0),
  scoring_config text not null,
  privacy_mode text not null check (
    privacy_mode in ('standard', 'delete_source_after_analysis')
  ),
  status text not null check (status in ('draft', 'processing', 'complete', 'failed')),
  created_at text not null,
  updated_at text not null,
  completed_at text
);

create table if not exists candidates (
  id text primary key,
  analysis_id text not null references analyses(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0),
  status text not null check (status in ('uploaded', 'parsed', 'ranked', 'failed')),
  parser_warnings text not null,
  created_at text not null
);

create table if not exists candidate_documents (
  id text primary key,
  candidate_id text not null references candidates(id) on delete cascade,
  storage_path text,
  original_filename text not null check (length(trim(original_filename)) > 0),
  content_type text not null check (content_type in ('application/pdf', 'text/plain')),
  size_bytes integer not null check (size_bytes > 0),
  retention_status text not null check (
    retention_status in ('stored', 'deleted', 'delete_failed')
  ),
  deleted_at text
);

create index if not exists candidates_analysis_idx
  on candidates(analysis_id);

create index if not exists candidate_documents_candidate_idx
  on candidate_documents(candidate_id);
