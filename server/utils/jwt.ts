import jwt from "jsonwebtoken";
import process from "node:process";

const SECRET = process.env.JWT_SECRET || "rahasia_default";
const EXPIRES = process.env.JWT_EXPIRES_IN || "3m";

export function signToken(payload: Record<string, any>) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES as any });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
