import { Router } from "express";

import {
    getSkillById,
    getSkills,
    selectSkill,
} from "../controllers/skill.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { skillsSearchLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    selectSkillBodySchema,
    skillIdParamSchema,
    skillsQuerySchema,
} from "../validators/skill.validation";

const router = Router();

router.get(
    "/api/skills",
    skillsSearchLimiter,
    validate(skillsQuerySchema, "query"),
    getSkills
);

router.get(
    "/api/skills/:skillId",
    validate(skillIdParamSchema, "params"),
    getSkillById
);

router.post(
    "/api/select-skill",
    requireAuth,
    validate(selectSkillBodySchema, "body"),
    selectSkill
);

export default router;
