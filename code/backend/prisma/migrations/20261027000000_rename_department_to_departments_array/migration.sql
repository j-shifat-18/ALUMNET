-- Rename single department column to departments array on JobPost
-- Existing data: migrate any non-null department value into the new array.

-- 1. Add the new array column (empty by default)
ALTER TABLE "JobPost" ADD COLUMN "departments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 2. Copy existing single-value department into the new array (if not null/empty)
UPDATE "JobPost"
SET "departments" = ARRAY["department"]
WHERE "department" IS NOT NULL AND "department" <> '';

-- 3. Drop the old column
ALTER TABLE "JobPost" DROP COLUMN "department";
