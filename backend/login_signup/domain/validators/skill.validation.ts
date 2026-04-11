import { z } from "zod";

export const skillsQuerySchema = z.object({
    search: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const skillIdParamSchema = z.object({
    skillId: z.string().trim().min(1),
});

export const selectSkillBodySchema = z.object({
    skillId: z.string().trim().min(1),
});
