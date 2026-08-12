import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";

import { validateBody } from "../middlewares/validateBody.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validateQuery } from "../middlewares/validateQuery.js";

import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller.js";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
  announcementsQuerySchema,
} from "../validators/announcements.validators.js";

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
  validateParams(announcementIdSchema),
  getAnnouncementById,
);

// Перевіряємо токен + body
announcementsRouter.post(
  "/",
  authenticate,
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

// Перевіряємо токен + :id + body
announcementsRouter.patch(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);

// Перевіряємо токен + :id
announcementsRouter.delete(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  deleteAnnouncement,
);

export default announcementsRouter;
