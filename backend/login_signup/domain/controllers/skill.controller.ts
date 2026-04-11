import { NextFunction, Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Skill } from "../models/skill.model";
import { User } from "../models/user.model";
import { ensureSkillsSeeded } from "../utils/seedSkills";

const buildSelectedSkillPayload = (skill: typeof Skill.prototype) => {
    return {
        id: skill.skillId,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        difficultyLevel: skill.difficultyLevel,
        estimatedDurationMonths: skill.estimatedDurationMonths,
        averageSalaryLPA: skill.averageSalaryLPA,
        jobDemandScore: skill.jobDemandScore,
    };
};

export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ensureSkillsSeeded();
        const { search, category, page, limit } = req.query as unknown as {
            search?: string;
            category?: string;
            page: number;
            limit: number;
        };

        const filter: Record<string, unknown> = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (category) {
            filter.category = category;
        }

        const skip = (page - 1) * limit;
        const total = await Skill.countDocuments(filter);
        const skills = await Skill.find(filter)
            .sort({ jobDemandScore: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: {
                skills,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getSkillById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await ensureSkillsSeeded();
        const { skillId } = req.params;
        const skill = await Skill.findOne({ skillId });
        if (!skill) {
            return res
                .status(404)
                .json({ success: false, message: "Skill not found" });
        }

        return res.status(200).json({ success: true, data: skill });
    } catch (error) {
        return next(error);
    }
};

export const selectSkill = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await ensureSkillsSeeded();
        const { skillId } = req.body as { skillId: string };
        const skill = await Skill.findOne({ skillId });
        if (!skill) {
            return res
                .status(404)
                .json({ success: false, message: "Skill not found" });
        }

        if (!req.user?.id) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { selectedSkill: skill._id },
            { new: true }
        );
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Skill selected successfully",
            data: {
                selectedSkill: buildSelectedSkillPayload(skill),
                roadmapInfo: {
                    status: "pending_beginner_test",
                    nextStep: "beginner-assessment",
                    roadmapId: null,
                    message:
                        "Skill saved. Please complete the Beginner Assessment to generate your personalized roadmap.",
                },
                userId: String(user._id),
            },
        });
    } catch (error) {
        return next(error);
    }
};
