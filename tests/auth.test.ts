import { describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../app.ts";
import prisma from "../prisma/client.ts";

describe("Auth API", () => {
  it("POST /auth/register повертає 201 при валідних даних", async () => {
    const username = `test_user_${Date.now()}`;
    const email = `${username}@example.com`;

    const response = await request(app).post("/auth/register").send({
      username,
      email,
      password: "password123",
      name: "Test User",
    });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    expect(response.body.user.username).toBe(username);
    expect(response.body.user.email).toBe(email);

    expect(response.body.user).not.toHaveProperty("password");

    await prisma.refreshToken.deleteMany({
      where: {
        userId: response.body.user.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: response.body.user.id,
      },
    });
  });

  it("POST /auth/login повертає 200 при правильному паролі", async () => {
    const username = `login_user_${Date.now()}`;
    const email = `${username}@example.com`;

    const passwordHash = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
        name: "Login User",
      },
    });

    const response = await request(app).post("/auth/login").send({
      username,
      password: "password123",
    });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    expect(response.body.user.username).toBe(username);

    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("POST /auth/login повертає 401 при неправильному паролі", async () => {
    const username = `wrong_password_${Date.now()}`;
    const email = `${username}@example.com`;

    const passwordHash = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
        name: "Wrong Password User",
      },
    });

    const response = await request(app).post("/auth/login").send({
      username,
      password: "wrongPassword",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "Invalid credentials",
    });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });
});
