import { generatePathSuggestions } from "@/lib/ai/suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      resumeText?: string;
      goal?: string;
      currentSkill?: string;
    };

    if (!body.resumeText || !body.goal) {
      return Response.json({ error: "Missing resumeText or goal." }, { status: 400 });
    }

    const suggestions = await generatePathSuggestions({
      resumeText: body.resumeText,
      goal: body.goal,
      currentSkill: body.currentSkill,
    });

    return Response.json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

