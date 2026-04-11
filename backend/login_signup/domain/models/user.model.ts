import { Document, Schema, Types, model } from "mongoose";

export interface UserDocument extends Document {
    name?: string;
    email?: string;
    selectedSkill?: Types.ObjectId | null;
}

const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String },
        email: { type: String, unique: true, index: true },
        selectedSkill: { type: Schema.Types.ObjectId, ref: "Skill", default: null },
    },
    { timestamps: true }
);

export const User = model<UserDocument>("User", UserSchema);
