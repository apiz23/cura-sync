-- Add soft-delete column to cura_medications.
-- Rows with a non-null deleted_at are treated as deleted by the API.

ALTER TABLE cura_medications
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Index so filtered queries stay fast.
CREATE INDEX IF NOT EXISTS idx_cura_medications_deleted_at
  ON cura_medications (deleted_at)
  WHERE deleted_at IS NULL;
