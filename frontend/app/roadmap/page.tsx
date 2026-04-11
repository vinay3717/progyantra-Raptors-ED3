import { redirect } from "next/navigation";

type RoadmapIndexProps = {
  searchParams: Promise<{ skill?: string | string[] }>;
};

export default async function RoadmapIndexPage({ searchParams }: RoadmapIndexProps) {
  const resolved = await searchParams;
  const rawSkill = Array.isArray(resolved.skill) ? resolved.skill[0] : resolved.skill;

  if (rawSkill) {
    redirect(`/roadmap/overview?skill=${encodeURIComponent(rawSkill)}`);
  }

  redirect("/roadmap/overview");
}
