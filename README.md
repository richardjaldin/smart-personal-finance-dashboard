# Smart Personal Finance Dashboard

A **Next.js** (App Router) expense tracker with **Chart.js** visualizations, **Lucide** icons, and **AI insights** via any **OpenAI-compatible** LLM API. Deploy to **Vercel** with minimal configuration.

## Features

- **CRUD** for expenses: amount, category, date, description
- **Dashboard** with KPIs and recent activity
- **Table** view for full list with edit/delete
- **Charts** view: category pie chart and monthly bar chart
- **AI insights**: patterns, recommendations, and anomaly hints grounded in your data (requires LLM env vars)
- **Dynamic UI**: data refreshes after every change

## Tech stack

- TypeScript, React 19, Next.js 16
- [Lucide React](https://lucide.dev/) icons
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Upstash Redis](https://upstash.com/) (REST) for serverless-friendly persistence on Vercel
- Generic LLM client: `POST /v1/chat/completions` with `Authorization: Bearer`

## Local development

```bash
cd smart-personal-finance-dashboard
npm install
cp .env.example .env.local
# Edit .env.local: add LLM_API_KEY for insights; add Redis vars for durable storage
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Redis, the API uses **in-memory** storage (sufficient for local testing). A banner explains this when `/api/status` reports memory mode.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | For production persistence | From Upstash (or Vercel Redis integration) |
| `UPSTASH_REDIS_REST_TOKEN` | With URL above | REST token |
| `LLM_API_KEY` | For AI insights | API key for your LLM provider |
| `LLM_API_URL` | Optional | Default `https://api.openai.com/v1` |
| `LLM_MODEL` | Optional | Default `gpt-4o-mini` |

You can use `OPENAI_API_KEY` / `OPENAI_MODEL` instead of `LLM_*` if you prefer; the server merges them in `lib/llm.ts`.

### Redis on Vercel

1. In the Vercel project, open **Storage** / **Marketplace** and add **Redis** (Upstash).
2. Link the integration to the project so `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set automatically, or paste them from the Upstash dashboard into **Settings → Environment Variables**.

### LLM providers

- **OpenAI**: set `LLM_API_KEY` and leave `LLM_API_URL` default (or set explicitly).
- **Groq**: `LLM_API_URL=https://api.groq.com/openai/v1` and your Groq key.
- **Azure OpenAI**: set `LLM_API_URL` to your resource’s chat completions endpoint base (per Azure docs) and the deployment name as `LLM_MODEL`.

## Deploy to Vercel

```bash
npm i -g vercel   # if needed
vercel
```

Or connect the Git repository in the Vercel dashboard. Ensure environment variables are set for production.

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/expenses` | List expenses |
| `POST` | `/api/expenses` | Create expense |
| `PATCH` | `/api/expenses/[id]` | Update expense |
| `DELETE` | `/api/expenses/[id]` | Delete expense |
| `POST` | `/api/insights` | Generate AI markdown report |
| `GET` | `/api/status` | Persistence mode and setup hint |

## License

MIT
