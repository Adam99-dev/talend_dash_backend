DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'normalizedName'
  ) THEN
    ALTER TABLE "companies" RENAME COLUMN "normalizedName" TO "normalized_name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'foundedYear'
  ) THEN
    ALTER TABLE "companies" RENAME COLUMN "foundedYear" TO "founded_year";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'headcountRange'
  ) THEN
    ALTER TABLE "companies" RENAME COLUMN "headcountRange" TO "headcount_range";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE "companies" RENAME COLUMN "createdAt" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "companies" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'companyId'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "companyId" TO "company_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'experienceYears'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "experienceYears" TO "experience_years";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'baseSalary'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "baseSalary" TO "base_salary";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'totalCompensation'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "totalCompensation" TO "total_compensation";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'confidenceScore'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "confidenceScore" TO "confidence_score";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'isVerified'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "isVerified" TO "is_verified";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salaries' AND column_name = 'submittedAt'
  ) THEN
    ALTER TABLE "salaries" RENAME COLUMN "submittedAt" TO "submitted_at";
  END IF;
END $$;

ALTER TABLE "salaries" DROP CONSTRAINT IF EXISTS "salaries_companyId_fkey";
ALTER TABLE "salaries" DROP CONSTRAINT IF EXISTS "salaries_company_id_fkey";

UPDATE "companies" SET "industry" = 'Unknown' WHERE "industry" IS NULL;
UPDATE "companies" SET "headquarters" = 'Unknown' WHERE "headquarters" IS NULL;

ALTER TABLE "companies" ALTER COLUMN "industry" SET NOT NULL;
ALTER TABLE "companies" ALTER COLUMN "headquarters" SET NOT NULL;

ALTER TABLE "companies" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "salaries" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "salaries" ALTER COLUMN "company_id" TYPE UUID USING "company_id"::uuid;

ALTER TABLE "salaries" ADD CONSTRAINT "salaries_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "salaries" DROP CONSTRAINT IF EXISTS "salaries_confidence_score_check";
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_confidence_score_check"
  CHECK ("confidence_score" >= 0.0 AND "confidence_score" <= 1.0);

ALTER TABLE "salaries" DROP CONSTRAINT IF EXISTS "salaries_experience_years_check";
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_experience_years_check"
  CHECK ("experience_years" > 0 AND "experience_years" < 51);

ALTER TABLE "salaries" DROP CONSTRAINT IF EXISTS "salaries_base_salary_check";
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_base_salary_check"
  CHECK ("base_salary" > 0);

DROP INDEX IF EXISTS "companies_normalizedName_idx";
DROP INDEX IF EXISTS "companies_normalizedName_key";
DROP INDEX IF EXISTS "companies_slug_idx";
DROP INDEX IF EXISTS "salaries_companyId_level_location_idx";
DROP INDEX IF EXISTS "salaries_totalCompensation_idx";
DROP INDEX IF EXISTS "salaries_submittedAt_idx";
DROP INDEX IF EXISTS "salaries_companyId_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "companies_normalized_name_key" ON "companies"("normalized_name");
CREATE INDEX IF NOT EXISTS "companies_normalized_name_idx" ON "companies"("normalized_name");
CREATE INDEX IF NOT EXISTS "salaries_company_id_level_location_idx" ON "salaries"("company_id", "level", "location");
CREATE INDEX IF NOT EXISTS "salaries_total_compensation_idx" ON "salaries"("total_compensation");
CREATE INDEX IF NOT EXISTS "salaries_submitted_at_idx" ON "salaries"("submitted_at");
CREATE INDEX IF NOT EXISTS "salaries_location_level_idx" ON "salaries"("location", "level");
CREATE INDEX IF NOT EXISTS "salaries_role_idx" ON "salaries"("role");
CREATE INDEX IF NOT EXISTS "salaries_currency_idx" ON "salaries"("currency");
