import { generateRoadmapFromResume } from "@/lib/ai/roadmap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      targetSkill?: string;
      difficultyBand?: "beginner" | "intermediate" | "advanced";
      resumeText?: string;
      userNotes?: string;
    };

    if (!body.targetSkill || !body.difficultyBand || !body.resumeText) {
      return Response.json(
        { error: "Missing targetSkill, difficultyBand, or resumeText." },
        { status: 400 }
      );
    }

    const roadmap = await generateRoadmapFromResume({
      targetSkill: body.targetSkill,
      difficultyBand: body.difficultyBand,
      resumeText: body.resumeText,
      userNotes: body.userNotes,
    });

    return Response.json({ roadmap });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

