import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateQuery =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.flattenError(result.error).fieldErrors,
      });
    }

    next();
  };