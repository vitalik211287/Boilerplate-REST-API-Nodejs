import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";

import { z } from "zod";

import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./validators/auth.validators.ts";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementParamsSchema,
  announcementsQuerySchema,
} from "./validators/announcements.validators.ts";


extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();


// =============================
// SECURITY
// =============================

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});


// =============================
// COMMON SCHEMAS
// =============================

const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
});


const userProfileSchema = userResponseSchema.extend({
  createdAt: z.string(),
});


const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});


const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});


const announcementResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  user: userResponseSchema,
});


const announcementsListResponseSchema = z.object({
  data: z.array(announcementResponseSchema),

  pagination: z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
    perPage: z.number(),
  }),
});


const errorSchema = z.object({
  error: z.string(),
});


const validationErrorSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});


// ======================================================
// AUTH
// ======================================================


// =============================
// POST /auth/register
// =============================

registry.registerPath({
  method: "post",
  path: "/auth/register",

  tags: ["Auth"],

  summary: "Register user",

  description:
    "Creates a new user, hashes the password and returns access and refresh tokens.",

  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "User registered successfully",

      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
    },

    400: {
      description: "Validation error",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    409: {
      description: "Username or email already taken",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// POST /auth/login
// =============================

registry.registerPath({
  method: "post",
  path: "/auth/login",

  tags: ["Auth"],

  summary: "Login user",

  description:
    "Authenticates a user using username and password and returns a new pair of tokens.",

  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Login successful",

      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
    },

    400: {
      description: "Validation error",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    401: {
      description: "Invalid credentials",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// POST /auth/refresh
// =============================

registry.registerPath({
  method: "post",
  path: "/auth/refresh",

  tags: ["Auth"],

  summary: "Refresh tokens",

  description:
    "Validates a refresh token, performs token rotation and returns a new pair of tokens.",

  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Tokens refreshed",

      content: {
        "application/json": {
          schema: tokensSchema,
        },
      },
    },

    400: {
      description: "Validation error",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    401: {
      description: "Invalid or expired refresh token",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// POST /auth/logout
// =============================

registry.registerPath({
  method: "post",
  path: "/auth/logout",

  tags: ["Auth"],

  summary: "Logout user",

  description:
    "Deletes the current user's refresh token from the database.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    204: {
      description: "Logout successful",
    },

    401: {
      description: "Unauthorized",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// GET /auth/me
// =============================

registry.registerPath({
  method: "get",
  path: "/auth/me",

  tags: ["Auth"],

  summary: "Get current user",

  description:
    "Returns information about the currently authenticated user.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Current user",

      content: {
        "application/json": {
          schema: userProfileSchema,
        },
      },
    },

    401: {
      description: "Unauthorized",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },

    404: {
      description: "User not found",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// ======================================================
// ANNOUNCEMENTS
// ======================================================


// =============================
// GET /announcements
// =============================

registry.registerPath({
  method: "get",
  path: "/announcements",

  tags: ["Announcements"],

  summary: "Get announcements",

  description:
    "Returns announcements with pagination, search and sorting.",

  request: {
    query: announcementsQuerySchema,
  },

  responses: {
    200: {
      description: "Announcements list",

      content: {
        "application/json": {
          schema: announcementsListResponseSchema,
        },
      },
    },

    400: {
      description: "Invalid query parameters",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
  },
});


// =============================
// GET /announcements/{id}
// =============================

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",

  tags: ["Announcements"],

  summary: "Get announcement by ID",

  request: {
    params: announcementParamsSchema,
  },

  responses: {
    200: {
      description: "Announcement found",

      content: {
        "application/json": {
          schema: announcementResponseSchema,
        },
      },
    },

    400: {
      description: "Invalid ID",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    404: {
      description: "Announcement not found",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// POST /announcements
// =============================

registry.registerPath({
  method: "post",
  path: "/announcements",

  tags: ["Announcements"],

  summary: "Create announcement",

  description:
    "Creates a new announcement for the authenticated user.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createAnnouncementSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Announcement created",

      content: {
        "application/json": {
          schema: announcementResponseSchema,
        },
      },
    },

    400: {
      description: "Validation error",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    401: {
      description: "Unauthorized",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// PATCH /announcements/{id}
// =============================

registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",

  tags: ["Announcements"],

  summary: "Update announcement",

  description:
    "Updates an announcement owned by the authenticated user.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: announcementParamsSchema,

    body: {
      content: {
        "application/json": {
          schema: updateAnnouncementSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Announcement updated",

      content: {
        "application/json": {
          schema: announcementResponseSchema,
        },
      },
    },

    400: {
      description: "Validation error",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    401: {
      description: "Unauthorized",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },

    403: {
      description: "Access denied",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },

    404: {
      description: "Announcement not found",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// =============================
// DELETE /announcements/{id}
// =============================

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",

  tags: ["Announcements"],

  summary: "Delete announcement",

  description:
    "Deletes an announcement owned by the authenticated user.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: announcementParamsSchema,
  },

  responses: {
    204: {
      description: "Announcement deleted",
    },

    400: {
      description: "Invalid ID",

      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },

    401: {
      description: "Unauthorized",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },

    403: {
      description: "Access denied",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },

    404: {
      description: "Announcement not found",

      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});


// ======================================================
// GENERATE DOCUMENT
// ======================================================

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(
    registry.definitions,
  );

  return generator.generateDocument({
    openapi: "3.0.0",

    info: {
      title: "Announcements API",
      version: "1.0.0",
      description:
        "REST API for authentication and announcements management",
    },

    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  });
}