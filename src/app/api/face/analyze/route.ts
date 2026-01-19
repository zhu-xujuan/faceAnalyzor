export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    return Response.json(
      {
        ok: false,
        error: "Not implemented",
        received: body
      },
      { status: 501 }
    );
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: "Invalid request",
        details: String(e)
      },
      { status: 400 }
    );
  }
}

