import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.ts";

import { validateBody } from "../middlewares/validateBody.ts";
import { validateParams } from "../middlewares/validateParams.ts";
import { validateQuery } from "../middlewares/validateQuery.ts";

import  upload  from "../middlewares/upload.ts";

import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller.ts";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementParamsSchema,
  announcementsQuerySchema,
} from "../validators/announcements.validators.ts";

const announcementsRouter = Router();

// Перевіряємо ?page=...&search=...&sort=...
announcementsRouter.get(
  "/",
  validateQuery(announcementsQuerySchema),
  getAllAnnouncements,
);

// Перевіряємо :id
announcementsRouter.get(
  "/:id",
  validateParams(announcementParamsSchema),
  getAnnouncementById,
);

// Перевіряємо токен + body
announcementsRouter.post(
  "/",
  authenticate,
  upload.single("image"),
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

// Перевіряємо токен + :id + body
announcementsRouter.patch(
  "/:id",
  authenticate,
  upload.single("image"),
  validateParams(announcementParamsSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);

// Перевіряємо токен + :id
announcementsRouter.delete(
  "/:id",
  authenticate,
  validateParams(announcementParamsSchema),
  deleteAnnouncement,
);

export default announcementsRouter;
