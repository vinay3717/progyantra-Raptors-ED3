import { skillsCatalog } from "../data/skillsCatalog";
import { Skill } from "../models/skill.model";

export const ensureSkillsSeeded = async (): Promise<void> => {
    const count = await Skill.estimatedDocumentCount();
    if (count > 0) {
        return;
    }
    await Skill.insertMany(skillsCatalog, { ordered: false });
};
