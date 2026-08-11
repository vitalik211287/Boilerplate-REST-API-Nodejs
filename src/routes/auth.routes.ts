import { Router } from "express";
import { validateBody } from "../middlewares/validateBody.ts";
import { registerSchema } from "../validators/auth.validators.ts";
import { registerUser } from "../controllers/auth.controller.ts";

// console.log("AUTH ROUTER LOADED");

const authRouter = Router();

authRouter.get("/", async (req, res) => {
  console.log("GET /auth WORKED");
  res.send("User logged in");
});

authRouter.post("/register", validateBody(registerSchema), registerUser);

export default authRouter;
