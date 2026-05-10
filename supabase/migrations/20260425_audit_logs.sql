-- Audit trail for clinically sensitive actions.
-- Append-only: no updates or deletes on this table.

CREATE TABLE IF NOT EXISTS public.cura_audit_logs (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  actor_id    text        NOT NULL,
  actor_type  text        NOT NULL CHECK (actor_type IN ('staff', 'patient')),
  action      text        NOT NULL CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
  resource_type text      NOT NULL,
  resource_id text,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cura_audit_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_cura_audit_logs_actor     ON public.cura_audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cura_audit_logs_resource  ON public.cura_audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_cura_audit_logs_created   ON public.cura_audit_logs (created_at DESC);

-- Prevent row-level updates and deletes via RLS (append-only enforcement).
ALTER TABLE public.cura_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_insert_only ON public.cura_audit_logs
  FOR INSERT WITH CHECK (true);
