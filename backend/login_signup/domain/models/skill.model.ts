import { Document, Schema, model } from "mongoose";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface SkillDocument extends Document {
    skillId: string;
    name: string;
    category: string;
    description: string;
    difficultyLevel: DifficultyLevel;
    estimatedDurationMonths: number;
    averageSalaryLPA: string;
    jobDemandScore: number;
}

const SkillSchema = new Schema<SkillDocument>(
    {
        skillId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        category: { type: String, required: true, index: true },
        description: { type: String, required: true },
        difficultyLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true,
        },
        estimatedDurationMonths: { type: Number, required: true, min: 1 },
        averageSalaryLPA: { type: String, required: true },
        jobDemandScore: { type: Number, required: true, min: 1, max: 10 },
    },
    { timestamps: true }
);

export const Skill = model<SkillDocument>("Skill", SkillSchema);
