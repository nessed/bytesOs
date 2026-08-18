# bytesOS

Finance tracker for a campus food business. Orders, revenue, cost and outstanding
debts — read live from the Google Sheet the business already runs on, crunched into
reports rather than replacing the team's workflow.

**Live:** https://bytes-os.vercel.app

---

## The design decision

The operation already lives in a shared Google Sheet, and asking people to
double-enter into a new system would have killed it in a week. So the sheet stays
the source of truth: an Express backend pulls from the Sheets API and the front end
does the aggregation and reporting on top.

## What it shows

- **Daily tracker** — orders and takings per day.
- **Finances view** — revenue against cost.
- **Customer table** — who's ordering.
- **Debt table** — what's outstanding and from whom.
- **Activity feed** — recent movement across the business.

## Stack

React · TypeScript · Vite — front end
Node · Express · `googleapis` · `xlsx` — backend and sheet access

## Running locally

```sh
# backend
npm install
npm start

# frontend
cd frontend && npm install && npm run dev
```

Google service-account credentials and the target sheet id are read from the
environment.
