import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";

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

announcementsRouter.post("/", authenticate, createAnnouncement);

announcementsRouter.patch("/:id", authenticate, updateAnnouncement);

announcementsRouter.delete("/:id", authenticate, deleteAnnouncement);

export default announcementsRouter;
