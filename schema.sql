CREATE TABLE app.flight_snapshots (
  id integer PRIMARY KEY,
  payload jsonb NOT NULL,
  synced_at timestamptz NOT NULL,
  source_total integer NOT NULL,
  source_pages integer NOT NULL,
  record_count integer NOT NULL,
  airlines jsonb,
  airlines_synced_at timestamptz
);

CREATE TABLE app.flight_sync_state (
  id integer PRIMARY KEY,
  refresh_started_at timestamptz,
  refresh_token text NOT NULL DEFAULT '',
  last_attempt_at timestamptz,
  last_error text,
  last_manual_at timestamptz
);
