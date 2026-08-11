import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginBody = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshBody = z.infer<typeof refreshSchema>;
