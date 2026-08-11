import { Router } from "express";

import { validateBody } from "../middlewares/validateBody.ts";
import { authenticate } from "../middlewares/authenticate.ts";

import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validators.ts";

import {
  registerUser,
  loginUser,
  refreshUser,
  logoutUser,
  getMe,
} from "../controllers/auth.controller.ts";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerUser);

authRouter.post("/login", validateBody(loginSchema), loginUser);

authRouter.post("/refresh", validateBody(refreshSchema), refreshUser);

authRouter.post("/logout", authenticate, logoutUser);

authRouter.get("/me", authenticate, getMe);

export default authRouter;
