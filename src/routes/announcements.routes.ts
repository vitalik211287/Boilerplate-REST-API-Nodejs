import {Router} from "express";

const announcementsRouter = Router(); 

announcementsRouter.get("/",(req, res)=> {
  // Logic to get all announcements
  res.send("Get all announcements");
}       );
// announcementsRouter.get("/:id", ...);
// announcementsRouter.post("/", ...);
// announcementsRouter.patch("/:id", ...);
// announcementsRouter.delete("/:id", ...);

export default announcementsRouter;