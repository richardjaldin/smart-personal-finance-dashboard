# Smart Personal Finance Dashboard

A **Next.js** (App Router) expense tracker with **Chart.js** visualizations, **Lucide** icons, and **AI insights** powered by **Groq** (or any OpenAI-compatible API). Deploy to **Vercel** with minimal configuration.

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
- **[Groq](https://groq.com/)** for fast inference (OpenAI-compatible `chat/completions`; configurable to other providers)

## Local development

```bash
cd smart-personal-finance-dashboard
npm install
cp .env.example .env.local
# Edit .env.local: add GROQ_API_KEY for insights; add KV_* for Redis storage
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Redis, the API uses **in-memory** storage (sufficient for local testing). A banner explains this when `/api/status` reports memory mode.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | For production persistence | From Upstash (or Vercel Redis / KV integration) |
| `KV_REST_API_TOKEN` | With URL above | REST token |
| `GROQ_API_KEY` | For AI insights (recommended) | From [Groq Console](https://console.groq.com/keys) |
| `LLM_API_URL` | Optional | Default `https://api.groq.com/openai/v1` |
| `LLM_MODEL` | Optional | Default `llama-3.3-70b-versatile` |

You can use `LLM_API_KEY` or `OPENAI_API_KEY` instead of `GROQ_API_KEY`; the server merges keys in `lib/llm.ts`. Set `LLM_API_URL` / `LLM_MODEL` to switch providers (e.g. OpenAI).

### Redis on Vercel

1. In the Vercel project, open **Storage** / **Marketplace** and add **Redis** (Upstash).
2. Link the integration to the project so `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set automatically (Vercel’s default names), or paste them from the Upstash dashboard into **Settings → Environment Variables**.

### LLM providers

- **Groq (default)**: set `GROQ_API_KEY`. Defaults use `https://api.groq.com/openai/v1` and `llama-3.3-70b-versatile` (override with `LLM_API_URL` / `LLM_MODEL` if you prefer another Groq model).
- **OpenAI**: `LLM_API_URL=https://api.openai.com/v1`, `LLM_MODEL=gpt-4o-mini`, and `LLM_API_KEY` or `OPENAI_API_KEY`.
- **Azure OpenAI**: set `LLM_API_URL` to your resource’s chat completions base URL and the deployment name as `LLM_MODEL`.

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
