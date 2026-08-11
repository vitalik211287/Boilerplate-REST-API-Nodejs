import { Router } from "express";

import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller.js";

const announcementsRouter = Router();

announcementsRouter.get("/", getAllAnnouncements);

announcementsRouter.get("/:id", getAnnouncementById);

announcementsRouter.post("/", createAnnouncement);

announcementsRouter.patch("/:id", updateAnnouncement);

announcementsRouter.delete("/:id", deleteAnnouncement);

export default announcementsRouter;