import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: z.flattenError(validationResult.error).fieldErrors,
      });
    }

    req.body = validationResult.data;

    next();
  };
};