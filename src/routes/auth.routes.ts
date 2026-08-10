import {Router} from "express";

const authRouter = Router();

authRouter.get("/", async (req, res) => {
  res.send("User logged in");
});

authRouter.post("/register", async (req, res) => {
  // Registration logic here
  res.send("User registered");
});

export default authRouter;  

