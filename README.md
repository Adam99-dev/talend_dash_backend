# TalentDash Backend

TalentDash is a salary intelligence backend built around one core rule: data quality is enforced at ingestion time. Company names are normalized before storage, salary totals are recomputed server-side, invalid enum values are rejected, and duplicate submissions are blocked before they can pollute aggregate calculations.

## Stack

- Next.js App Router API routes
- PostgreSQL
- Prisma ORM
- Zod request validation
- TypeScript

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file with a PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Seed the database:

```bash
npm run seed
```

Run the API locally:

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

## Data Model

`Company` is a first-class table, not a string on salary rows. Salaries reference companies by `company_id`, allowing all salary aggregates to use normalized company identity.

Important guarantees:

- Company names normalize through lowercase, trimming, punctuation stripping, legal suffix removal, and known alias resolution.
- `level`, `currency`, and `source` are Prisma enums.
- `total_compensation` is always recomputed by the backend as `base_salary + bonus + stock`.
- `confidence_score` is constrained to `0.0` through `1.0`.
- `experience_years` is constrained to greater than `0` and less than `51`.
- Primary query indexes exist for company-level-location filters, compensation sorting, recency sorting, and geo-level filters.

## API

### `POST /api/ingest-salary`

Accepts a salary submission, validates it, normalizes or creates the company, checks for duplicates, recomputes `total_compensation`, and stores the row.

Example:

```bash
curl -X POST http://localhost:3000/api/ingest-salary \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Google Inc.",
    "role": "Software Engineer",
    "level": "L5",
    "location": "Bengaluru",
    "currency": "INR",
    "experience_years": 7,
    "base_salary": 4500000,
    "bonus": 800000,
    "stock": 1200000,
    "total_compensation": 1,
    "source": "CONTRIBUTOR",
    "confidence_score": 0.95
  }'
```

Validation errors return a per-field response:

```json
{
  "error": true,
  "field": "level",
  "message": "Level must be one of: L3, L4, L5, L6, SDE_I, SDE_II, SDE_III, STAFF, PRINCIPAL, IC4, IC5"
}
```

Duplicate salary submissions return `409 Conflict`.

### `GET /api/salaries`

Returns paginated salary rows.

Query parameters:

- `company`: case-insensitive partial match
- `role`: case-insensitive partial match
- `level`: exact enum match
- `location`: case-insensitive partial match
- `currency`: exact enum match
- `sort`: `total_comp_desc`, `total_comp_asc`, or `date_desc`
- `page`: default `1`
- `limit`: default `25`, max `100`

Example:

```bash
curl "http://localhost:3000/api/salaries?company=goo&role=software&level=L5&location=bengaluru&currency=INR&sort=total_comp_desc&page=1&limit=25"
```

Response shape:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 25,
    "totalPages": 0
  }
}
```

### `GET /api/companies/:slug`

Returns company metadata, salary rows sorted by `total_compensation` descending, true median compensation, and level distribution.

Example:

```bash
curl http://localhost:3000/api/companies/google
```

Unknown companies return:

```json
{
  "error": true,
  "message": "Company not found"
}
```

### `GET /api/compare`

Compares two salary records by UUID.

Example:

```bash
curl "http://localhost:3000/api/compare?s1=FIRST_SALARY_UUID&s2=SECOND_SALARY_UUID"
```

Returns both records plus:

```json
{
  "delta": {
    "base_delta": 0,
    "bonus_delta": 0,
    "stock_delta": 0,
    "tc_delta": 0,
    "experience_delta": 0
  }
}
```

Identical IDs return `400`. Missing IDs return `404`.

## Seed Data

The seed script creates 72 salary records across:

- Google, Amazon, Meta, Microsoft, Flipkart, Meesho, NVIDIA, TCS, Infosys, Wipro, Razorpay, Zepto
- Bengaluru, Mumbai, Hyderabad, Pune, Delhi, San Francisco, London
- INR and USD
- All supported levels, including `PRINCIPAL`

Seed edge cases include:

- Zero bonus
- Zero stock
- Very high equity
- Principal-level compensation
- Google aliases: `Google India`, `GOOGLE`, and `google` all normalize to the same `google` company slug

## Quality Checks

```bash
npm run lint
npm run build
npx prisma validate
```
