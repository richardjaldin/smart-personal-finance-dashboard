export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmConfigFromEnv(): LlmConfig | null {
  const apiKey = process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl =
    process.env.LLM_API_URL?.replace(/\/$/, "") ??
    "https://api.openai.com/v1";
  const model =
    process.env.LLM_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  return { apiKey, baseUrl, model };
}

/**
 * OpenAI-compatible chat completions. Works with OpenAI, Azure OpenAI
 * (chat path), Groq, Together, local Ollama with OpenAI shim, etc.
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
