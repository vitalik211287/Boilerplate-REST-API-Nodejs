import { z } from "zod";

// POST /announcements
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
});

// PATCH /announcements/:id
export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// /announcements/:id
export const announcementParamsSchema = z.object({
  id: z.coerce.number().int().positive("Announcement ID must be positive"),
});

// GET /announcements?page=1&search=...&sort=...
export const announcementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),

  search: z.string().optional(),

  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
});
