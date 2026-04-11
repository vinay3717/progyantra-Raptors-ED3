import { generateRagStyleQuestions } from "@/lib/ai/questions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      skill?: string;
      difficultyBand?: "beginner" | "intermediate" | "advanced";
      count?: number;
      roadmapContext?: {
        overview?: string;
        units?: Array<{ title: string; subpoints: string[] }>;
      };
    };

    if (!body.skill) {
      return Response.json({ error: "Missing skill." }, { status: 400 });
    }

    const data = await generateRagStyleQuestions({
      skill: body.skill,
      difficultyBand: body.difficultyBand,
      count: body.count,
      roadmapContext: body.roadmapContext,
    });

    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

