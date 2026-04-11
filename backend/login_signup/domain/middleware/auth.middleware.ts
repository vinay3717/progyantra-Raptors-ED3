import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || ""
        ) as JwtPayload | string;
        if (typeof payload === "string" || !payload.sub) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }
        req.user = { id: String(payload.sub) };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
