type GroqChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function groqChatJSON<T>(params: {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const model = params.model ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  async function request(useResponseFormat: boolean) {
    const body: Record<string, unknown> = {
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.6,
      max_tokens: params.max_tokens ?? 300
    };
    if (useResponseFormat) body.response_format = { type: "json_object" };

    return fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  let res = await request(true);
  if (!res.ok) {
    // Some providers/models don't support response_format; retry once without it.
    res = await request(false);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Groq returned empty content");
  try {
    return JSON.parse(content) as T;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1)) as T;
    }
    throw new Error("Groq returned non-JSON content");
  }
}
