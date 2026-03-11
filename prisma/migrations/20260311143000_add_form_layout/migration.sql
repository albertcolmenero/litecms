-- AlterTable
ALTER TABLE "Form"
ADD COLUMN "layout" TEXT;

-- Backfill existing forms to deterministic default
UPDATE "Form"
SET "layout" = 'stacked'
WHERE "layout" IS NULL;
