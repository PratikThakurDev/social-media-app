import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import redis from "../../config/redis";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt";

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { email: data.email, password: hashedPassword, name: data.name },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redis.set(`refresh:${user.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redis.set(`refresh:${user.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {

  const decoded = verifyToken(refreshToken, true);
  if (!decoded) throw new Error("Invalid or expired refresh token");

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");

  const stored = await redis.get(`refresh:${decoded.id}`);
  if (stored !== refreshToken)
    throw new Error("Invalid or revoked refresh token");

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await redis.set(
    `refresh:${user.id}`,
    newRefreshToken,
    "EX",
    60 * 60 * 24 * 7
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken: string) => {
  const decoded = verifyToken(refreshToken, true);
  if (!decoded) throw new Error("Invalid or expired refresh token");

  await redis.del(`refresh:${decoded.id}`);
  return true;
};
