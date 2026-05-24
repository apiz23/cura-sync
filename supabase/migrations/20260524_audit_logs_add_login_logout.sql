-- Extend cura_audit_logs action CHECK constraint to include LOGIN and LOGOUT.
-- Previously only CREATE/READ/UPDATE/DELETE were allowed, which caused silent
-- insert failures (logAudit catches all errors) whenever a staff member logged
-- in or out.

ALTER TABLE public.cura_audit_logs
    DROP CONSTRAINT cura_audit_logs_action_check;

ALTER TABLE public.cura_audit_logs
    ADD CONSTRAINT cura_audit_logs_action_check CHECK (
        action = ANY (ARRAY[
            'CREATE'::text,
            'READ'::text,
            'UPDATE'::text,
            'DELETE'::text,
            'LOGIN'::text,
            'LOGOUT'::text
        ])
    );
