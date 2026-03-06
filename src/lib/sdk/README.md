# @mesocrats/mce-sdk

Official TypeScript SDK for the Mesocratic Compliance Engine (MCE) API. Fully typed. Generated from our OpenAPI spec.

## Installation

```bash
npm install @mesocrats/mce-sdk
```

## Quick Start

```typescript
import { MesocraticClient } from '@mesocrats/mce-sdk';

const client = new MesocraticClient({
  TOKEN: 'mce_live_your_api_key',
});

// Get your committee
const { data: committee } = await client.committees.getCommittee();
console.log(committee?.name);

// Record a contribution
const { data: contribution } = await client.contributions.createContribution({
  contributor_id: 'uuid',
  amount_cents: 25000,
  date_received: '2026-03-06',
  contribution_type: 'individual',
});
```

## Services

### CommitteesService

Manage your committee record.

```typescript
client.committees.getCommittee()
client.committees.createCommittee({ name: 'My Committee', committee_type: 'pac' })
```

### ContributorsService

Create and search contributor records.

```typescript
client.contributors.listContributors(page, limit, search)
client.contributors.createContributor({ first_name: 'Jane', last_name: 'Doe', state: 'VA', zip_code: '22201' })
```

### ContributionsService

Record contributions with automatic FEC limit enforcement and YTD aggregate tracking.

```typescript
client.contributions.listContributions(page, limit, startDate, endDate, contributorId, itemized)
client.contributions.createContribution({ contributor_id, amount_cents, date_received })
client.contributions.getContribution(id)
```

### DisbursementsService

Track committee expenditures.

```typescript
client.disbursements.listDisbursements(page, limit, startDate, endDate, category)
client.disbursements.createDisbursement({ payee_name, amount_cents, date, purpose })
```

### ReportsService

Create and manage FEC filing reports.

```typescript
client.reports.listReports(status, reportType)
client.reports.createReport({ coverage_start, coverage_end, report_type: 'quarterly' })
```

### ComplianceService

Look up FEC contribution limits for your committee type.

```typescript
client.compliance.getComplianceLimits()
```

### SystemService

Health check (no authentication required).

```typescript
client.system.getHealth()
```

## Models

The SDK exports fully typed models for all API responses:

| Model | Description |
|-------|-------------|
| `Committee` | Committee record with FEC ID, type, treasurer info |
| `Contribution` | Individual contribution with amount, date, itemization status |
| `Contributor` | Donor record with name, address, employer, occupation |
| `Disbursement` | Expenditure record with payee, purpose, category |
| `Report` | FEC filing report with coverage period and status |
| `AggregateInfo` | Year-to-date contribution aggregate for a contributor |
| `Limit` | FEC contribution limit by committee type |
| `Page` | Paginated response page |
| `Pagination` | Pagination metadata (page, limit, total, total_pages) |
| `Error` | API error response |

## API Reference

Full API documentation: [developer.mesocrats.org/api-reference](https://developer.mesocrats.org/api-reference)

OpenAPI spec: [developer.mesocrats.org/openapi.json](https://developer.mesocrats.org/openapi.json)

## License

MIT
