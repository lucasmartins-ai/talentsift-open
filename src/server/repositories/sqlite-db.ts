import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

export type SqliteDatabase = Database.Database;

const DEFAULT_SQLITE_DATABASE_PATH = "data/talentsift-open.sqlite";

const schema = `
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
`;

let appDatabase: SqliteDatabase | null = null;

export function createSqliteDatabase(
  databasePath = process.env.SQLITE_DATABASE_PATH ??
    DEFAULT_SQLITE_DATABASE_PATH,
): SqliteDatabase {
  const resolvedPath = resolveDatabasePath(databasePath);
  if (resolvedPath !== ":memory:") {
    mkdirSync(dirname(resolvedPath), { recursive: true });
  }

  const database = new Database(resolvedPath);
  database.pragma("foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  database.exec(schema);
  return database;
}

export function getAppSqliteDatabase(): SqliteDatabase {
  appDatabase ??= createSqliteDatabase();
  return appDatabase;
}

function resolveDatabasePath(databasePath: string) {
  if (databasePath === ":memory:" || isAbsolute(databasePath)) {
    return databasePath;
  }

  const normalized = databasePath
    .replaceAll("\\", "/")
    .replace(/^\.?\/*/, "")
    .replace(/^data\//, "");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0 || segments.includes("..")) {
    throw new Error("SQLITE_DATABASE_PATH must be a file path inside data/.");
  }

  return join(process.cwd(), "data", segments.join("/"));
}
