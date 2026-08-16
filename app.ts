import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";

import logger from "./src/logger.ts";
import { generateOpenApiDocument } from "./src/openapi.ts";
import authRouter from "./src/routes/auth.routes.js";
import announcementsRouter from "./src/routes/announcements.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later",
  },
});

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/announcements", announcementsRouter);
app.use("/auth", authLimiter, authRouter);

const openApiDocument = generateOpenApiDocument();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Request failed");

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Validation failed",
      details: {
        body: ["Invalid JSON format in request body"],
      },
    });
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Resource not found",
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Unique constraint violation",
    });
  }

  if (err.code === "P2003") {
    return res.status(400).json({
      error: "Foreign key constraint failed",
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(
      `Server is running on port ${PORT}: http://localhost:${PORT}/api-docs`,
    );
  });
}

export default app;
