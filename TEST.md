# TalentDash API test guide

Hosted backend: `https://talend-dash-backend.vercel.app`

API base URL: `https://talend-dash-backend.vercel.app/api`

Measured on 19 June 2026 from a development machine in India. Response times include network and Vercel latency, so they are observations rather than an SLA.

## Route summary

| Route | Method | Purpose | Success status |
| --- | --- | --- | --- |
| `/api/ingest-salary` | `POST` | Validate and store one salary record | `201 Created` |
| `/api/salaries` | `GET` | Filter, sort, and paginate salary records | `200 OK` |
| `/api/companies/{slug}` | `GET` | Retrieve a company, salary statistics, and salary records | `200 OK` |
| `/api/compare?s1={id}&s2={id}` | `GET` | Retrieve two salary records and their compensation deltas | `200 OK` |

All request and response bodies use JSON. Send `Content-Type: application/json` with `POST` requests. GET filters are case-insensitive partial matches for `company`, `role`, and `location`; `level` and `currency` must be exact enum values.

## `POST /api/ingest-salary`

Required body fields are `company`, `role`, `level`, `location`, `currency`, `experience_years`, `base_salary`, `source`, and `confidence_score`. `bonus` and `stock` default to zero. Accepted levels are `L3`, `L4`, `L5`, `L6`, `SDE_I`, `SDE_II`, `SDE_III`, `STAFF`, `PRINCIPAL`, `IC4`, and `IC5`. Accepted currencies are `INR`, `USD`, `GBP`, and `EUR`. Accepted sources are `CONTRIBUTOR`, `SCRAPED`, and `AI_INFERRED`.

1. Perfect example: send a complete valid body with a unique company/role/base-salary combination. Expect `201`; verify the returned fields and that `total_compensation = base_salary + bonus + stock`.
2. Typo example: send `base_salry` instead of `base_salary`. Expect `400` with `field: "base_salary"`; no salary or company is stored.
3. Invalid example: send `level: "Senior Software Engineer"`. Expect `400` with `field: "level"`; no salary or company is stored.
4. Edge case: send `base_salary: -100`. Expect `400` with `field: "base_salary"`; no salary or company is stored.
5. Edge case: send a valid body with an incorrect client value such as `total_compensation: 1`. Expect `201`; the server ignores that field and stores its own correct sum.

Example valid body:

```json
{
  "company": "Example Labs",
  "role": "Software Engineer",
  "level": "L5",
  "location": "Bengaluru",
  "currency": "INR",
  "experience_years": 8,
  "base_salary": 2000000,
  "bonus": 250000,
  "stock": 500000,
  "source": "CONTRIBUTOR",
  "confidence_score": 0.9
}
```

## `GET /api/salaries`

Supported query parameters are `company`, `role`, `level`, `location`, `currency`, `sort`, `page`, and `limit`. Sort values are `total_comp_desc`, `total_comp_asc`, and `date_desc`. The default page is 1, the default limit is 25, and the maximum limit is 100.

1. Perfect example: request `/api/salaries?company=NVIDIA&role=Backend%20Engineer&level=PRINCIPAL&location=Mumbai&currency=INR&sort=total_comp_desc&page=1&limit=10`. Expect `200`, one matching record in the current hosted data, and metadata reflecting page 1 and limit 10.
2. Typo example: request `/api/salarie`. Expect `404` because the route name is misspelled.
3. Invalid example: request `/api/salaries?level=Senior%20Software%20Engineer`. Expect `400` with `Invalid level`.
4. Edge case: request a company filter that has no matches. Expect `200`, `data: []`, `meta.total: 0`, `meta.page: 1`, and `meta.totalPages: 1`.
5. Edge case: request `/api/salaries?limit=10000`. Expect `200`, at most 100 records, and `meta.limit: 100`.

All filters in the perfect example are combined with AND logic. Text matching inside each filter remains case-insensitive.

## `GET /api/companies/{slug}`

The path parameter is the normalized company slug. A successful response includes company metadata, median total compensation, level distribution, and salary records ordered by total compensation descending.

1. Perfect example: request `/api/companies/nvidia`. Expect `200` with `company.slug: "nvidia"`.
2. Typo example: request `/api/companies/nvida`. Expect `404` with `Company not found`.
3. Invalid example: request `/api/companies/%20`. Expect `404`; a blank slug is not a valid company.
4. Edge case: request `/api/companies/nonexistent-slug`. Expect `404` with `Company not found`.
5. Edge case: request a valid slug whose company has only one salary. Expect `200`; the median equals that record's total compensation and its level count is 1.

## `GET /api/compare`

Both `s1` and `s2` are required salary UUID query parameters. The IDs must differ and both records must exist. A successful response includes both records and signed deltas calculated as record 1 minus record 2.

1. Perfect example: request `/api/compare?s1=c7b8c0da-36fc-4fb3-be75-70d83ec9c734&s2=e9d983ca-3198-45d6-b030-06df9e3fa56f`. Expect `200` with `record_1`, `record_2`, and `delta`.
2. Typo example: use `s11` instead of `s1`. Expect `400` stating that `s1` and `s2` are required.
3. Invalid example: provide two different, well-formed UUIDs that do not exist. Expect `404` stating that one or both records were not found.
4. Edge case: provide the same valid ID for both parameters. Expect `400` with `Salary IDs must be different`.
5. Edge case: omit `s2`. Expect `400` stating that both query parameters are required.

## Hosted edge-test results

| Test | Status | Observed time | Result |
| --- | ---: | ---: | --- |
| Negative `base_salary` | 400 | 797 ms | Passed; validation rejected the body |
| Invalid full-title level | 400 | 299 ms | Passed; enum validation rejected the body |
| Incorrect pre-filled total | 201 | 393 ms | Passed; `1` was replaced with `2,750,000` |
| All salary filters together | 200 | 349 ms | Passed; returned the single matching NVIDIA record |
| Nonexistent company slug | 404 | 323 ms | Passed |
| Same valid compare ID | 400 | 308 ms | Passed |
| Limit of 10,000 | 200 | 344 ms | Passed; returned `meta.limit: 100` |

The two rejected ingestion sentinels were also checked directly in the database after the requests. Neither a company nor a salary record was created. The hosted API currently returns `400 Invalid page` for a zero-match salary search; the source fix makes page 1 return the empty `200` response described above and takes effect after deployment.

## Retrieval-speed checks

For a repeatable latency sample, make three to five requests after one warm-up request and report median end-to-end time. Keep the query and deployment region unchanged. Record status, response bytes, and time-to-first-byte when diagnosing regressions. Do not compare a Vercel cold start directly with a warm request.

Suggested acceptance targets for this small dataset are a warm median below 500 ms for GET routes and below 750 ms for ingestion. These are project test targets, not guarantees from the hosting provider. The measured warm GET requests above were 308-349 ms; the first cold salary request took 1,268 ms.
