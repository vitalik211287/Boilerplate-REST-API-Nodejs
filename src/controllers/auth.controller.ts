import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { RegisterBody } from "../validators/auth.validators.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
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
    username: newUser.username,
    email: newUser.email,
    name: newUser.name,
  });
};

// LOGIN
const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  const accessToken = jwt.sign(
    {
      sub: user.id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
};

// REFRESH
const refreshUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokenFromDb = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken,
    },
  });

  if (!tokenFromDb) {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    const accessToken = jwt.sign(
      {
        sub: payload.sub,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    res.status(200).json({
      accessToken,
    });
  } catch {
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  const userId = Number(req.user?.sub);

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });

  res.status(204).end();
};

const getMe = async (req: Request, res: Response) => {
  const userId = Number(req.user?.sub);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.status(200).json(user);
};

export { registerUser, loginUser, refreshUser, logoutUser, getMe };
