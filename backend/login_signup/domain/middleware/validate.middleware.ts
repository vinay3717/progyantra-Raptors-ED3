import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate = (
    schema: ZodSchema,
    source: "body" | "query" | "params"
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error.flatten(),
            });
        }
        (req as any)[source] = result.data;
        return next();
    };
};
