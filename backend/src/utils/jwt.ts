import bcrypt from "bcrypt" ;
import jwt from "jsonwebtoken";

export const passwordHasher = async (password : string ) => {
    return await bcrypt.hash(password,10) ;
}

export const generateAccessToken = (user: { id: string}) => {
  return jwt.sign({ id: user.id}, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (user: { id: string }) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh
    ? process.env.JWT_REFRESH_SECRET!
    : process.env.JWT_SECRET!;
  try {
    return jwt.verify(token, secret) as { id: string };
  } catch {
    return null;
  }
};
