import { generateAssessmentOverview } from "@/lib/ai/assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      skill?: string;
      score?: number;
      total?: number;
      wrongQuestions?: Array<{ prompt: string; chosen: string; correct: string }>;
    };

    if (!body.skill || typeof body.score !== "number" || typeof body.total !== "number") {
      return Response.json(
        { error: "Missing skill, score, or total." },
        { status: 400 }
      );
    }

    const overview = await generateAssessmentOverview({
      skill: body.skill,
      score: body.score,
      total: body.total,
      wrongQuestions: body.wrongQuestions ?? [],
    });

    return Response.json({ overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

