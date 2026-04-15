export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

/** Defaults target Groq’s OpenAI-compatible API (https://console.groq.com/). */
const DEFAULT_GROQ_BASE = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export function getLlmConfigFromEnv(): LlmConfig | null {
  const apiKey =
    process.env.GROQ_API_KEY ??
    process.env.LLM_API_KEY ??
    process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl =
    process.env.LLM_API_URL?.replace(/\/$/, "") ?? DEFAULT_GROQ_BASE;
  const model =
    process.env.LLM_MODEL ??
    process.env.OPENAI_MODEL ??
    DEFAULT_GROQ_MODEL;
  return { apiKey, baseUrl, model };
}

/**
 * OpenAI-compatible chat completions (Groq by default; also works with OpenAI,
 * Azure, Together, Ollama shims, etc.).
 */
export async function chatCompletion(
  messages: ChatMessage[],
  config: LlmConfig
): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return content.trim();
}
