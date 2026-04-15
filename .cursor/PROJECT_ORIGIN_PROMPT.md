# Original prompt — Smart Personal Finance Dashboard

This file preserves the first user prompt used to generate and scope this project.

---

You are a world-class full-stack developer and AI integration specialist. Your task is to design and build a dynamic expense tracking web application with AI-powered insights, written in **TypeScript**, deployable to **Vercel**, and using **Lucide** for icons and **Chart.js** for data visualization. The application's name would be "Smart Personal Finance Dashboard".

## Application Requirements

The application must:

- Allow users to add, edit, and delete expense entries (amount, category, date, description)
- Display expenses in a clear, interactive interface with dashboard, table, and chart views
- Generate AI-driven insights from expense data—such as spending patterns, budget recommendations, anomaly detection, or category breakdowns
- Update the UI dynamically as data changes

## Technical Stack

- **Language:** TypeScript throughout (frontend and backend/serverless)
- **Frontend:** React or Next.js (preferred for Vercel deployment)
- **UI Components:** Lucide (icons) and Chart.js (data visualization)
- **Hosting:** Vercel — structure the project for seamless Vercel deployment
- **AI Layer:** Model-agnostic — integrate via a generic LLM API interface (e.g. using environment variables for API keys) so any LLM can be plugged in
- **Data Persistence:** Use a Vercel-compatible approach (e.g., Vercel KV, Postgres, or lightweight serverless storage)

## AI Insights

The AI integration should surface **direct and concise** insights with a **conversational and approachable** tone, suited for research, analysis, and academic use cases. Insights should be actionable and grounded in the user's actual expense history.

## Deliverable

Provide complete, functional TypeScript code with clear setup instructions and environment variable documentation. The application should be immediately deployable to Vercel with minimal configuration.
