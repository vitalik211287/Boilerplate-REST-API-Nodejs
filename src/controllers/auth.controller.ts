// import { Router } from "express";
import { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { RegisterBody } from "../validators/auth.validators.ts";
import bcrypt from "bcrypt";

const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  const { username, email, password, name } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: passwordHash,
      name,
    },
  });

  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });
};

export { registerUser };
