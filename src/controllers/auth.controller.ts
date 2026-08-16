import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { RegisterBody } from "../validators/auth.validators.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../logger.ts";

// REGISTER
const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  const { username, email, password, name } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      error: "Username or email already taken",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: passwordHash,
      name,
    },
  });

  const accessToken = jwt.sign(
    {
      sub: newUser.id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    {
      sub: newUser.id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newUser.id,
    },
  });
  logger.info(
    { userId: newUser.id, username: newUser.username },
    "User registered",
  );
  res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
    },
    accessToken,
    refreshToken,
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
      error: "Invalid credentials",
    });
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    return res.status(401).json({
      error: "Invalid credentials",
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

  // Видаляємо старий refresh token
  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // Записуємо новий
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  logger.info({ userId: user.id, username: user.username }, "User logged in");

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
};

// REFRESH
const refreshUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    const oldToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (!oldToken) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    const userId = Number(payload.sub);

    const newAccessToken = jwt.sign(
      {
        sub: userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = jwt.sign(
      {
        sub: userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    // Token rotation:
    // видаляємо старий refresh token
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });

    // записуємо новий refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId,
      },
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }
};

// LOGOUT
const logoutUser = async (req: Request, res: Response) => {
  const userId = Number(req.user?.sub);

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });

  res.status(204).end();
};

// GET ME
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
