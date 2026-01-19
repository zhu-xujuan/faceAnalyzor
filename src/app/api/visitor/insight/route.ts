import { groqChatJSON } from "@/lib/groq";

type Mood = "happy" | "satisfied" | "confused" | "not_great";

type ReqBody = {
  mood: Mood;
  eventName?: string;
  locale?: "ja" | "en";
};

type RespBody = {
  ok: boolean;
  category?: string;
  confidence?: number;
  title?: string;
  message?: string;
  error?: string;
};

function isMood(v: unknown): v is Mood {
  return v === "happy" || v === "satisfied" || v === "confused" || v === "not_great";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!isMood(body?.mood)) {
      return Response.json({ ok: false, error: "Invalid mood" } satisfies RespBody, { status: 400 });
    }

    const locale = body.locale ?? "ja";
    const eventName = body.eventName ?? process.env.NEXT_PUBLIC_EVENT_NAME ?? "展示会";

    const result = await groqChatJSON<{
      category: string;
      confidence: number;
      title: string;
      message: string;
    }>({
      temperature: 0.7,
      max_tokens: 260,
      messages: [
        {
          role: "system",
          content:
            "You generate short, playful, exhibit-friendly labels and copy. Never claim to infer feelings from a face photo. Base output ONLY on the provided self-report mood."
        },
        {
          role: "user",
          content: JSON.stringify({
            locale,
            eventName,
            self_report_mood: body.mood,
            task:
              "Return a JSON object with: category (short label), confidence (0..1), title (very short), message (1-2 short sentences). Tone: fun, respectful, not creepy."
          })
        }
      ]
    });

    return Response.json(
      {
        ok: true,
        category: result.category,
        confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
        title: result.title,
        message: result.message
      } satisfies RespBody,
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ ok: false, error: String(e) } satisfies RespBody, { status: 500 });
  }
}

