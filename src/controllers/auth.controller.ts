// import { Router } from "express";
import { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { RegisterBody } from "../validators/auth.validators.ts";
import bcrypt from "bcrypt";

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  const newUser = await prisma.user.create({ data: req.body });
  res
    .status(201)
    .json({ id: newUser.id, email: newUser.email, name: newUser.name });
};

export { registerUser };
