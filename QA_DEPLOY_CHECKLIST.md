# Havyn QA and Deployment Checklist

## Security Validation
- Verify `https://` redirect and HSTS enabled in non-development.
- Verify CSP header in browser dev tools response headers.
- Validate password policy (length >= 12, upper/lower/digit/symbol).
- Confirm role boundaries:
  - `ExecutiveAdmin`: global management + analytics.
  - `RegionalManager`: scoped operations and read-only partner management.
  - `SocialWorker`: assigned caseload, forms, to-do, appointments.
  - `Donor`: own-facing donation and impact.

## Workflow Smoke Tests
- Donor registration requires privacy policy acceptance.
- Login works for seeded role users.
- Resident close and reopen endpoints function with role restrictions.
- Donation create + allocation + in-kind item endpoints persist correctly.
- Reports endpoints return aggregate values and CSV export.
- ML endpoints return risk predictions and recommendations.

## Data Validation
- Confirm CSV bootstrapping populated all primary tables.
- Confirm no restricted fields appear in public impact page.
- Confirm safehouse/donor/resident relationships are valid.

## Deployment Steps
- Set production `ConnectionStrings:DefaultConnection`.
- Set `CsvData:RootPath` to production ingest location (or disable seed after initial import).
- Build backend and frontend.
- Deploy backend API + frontend assets.
- Run `scripts/smoke-tests.ps1` against deployed base URL.
