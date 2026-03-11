-- AlterTable
ALTER TABLE "Form"
ADD COLUMN "ctaText" TEXT,
ADD COLUMN "additionalSubmitUrl" TEXT,
ADD COLUMN "fields" JSONB;

-- AlterTable
ALTER TABLE "Lead"
ALTER COLUMN "email" DROP NOT NULL;

-- Backfill existing forms with safe defaults for compatibility
UPDATE "Form"
SET
  "ctaText" = COALESCE("ctaText", 'Join Waitlist'),
  "fields" = COALESCE(
    "fields",
    jsonb_build_array(
      jsonb_build_object(
        'id', 'email',
        'key', 'email',
        'label', 'Email',
        'type', 'email',
        'required', true,
        'placeholder', 'Enter your email',
        'order', 0
      )
    )
  )
WHERE "fields" IS NULL OR "ctaText" IS NULL;
