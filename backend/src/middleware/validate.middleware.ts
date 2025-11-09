import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      const formattedErrors = z.treeifyError(parseResult.error) ;

      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: formattedErrors,
      });
    }

    next();
  };
