import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateParams =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.flattenError(result.error).fieldErrors,
      });
    }

    next();
  };