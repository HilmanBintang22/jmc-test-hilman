import jwt from 'jsonwebtoken';
import process from 'node:process';

const SECRET = process.env.JWT_SECRET || "rahasia_default";
const EXPIRES = process.env.JWT_EXPIRES_IN || "3m";
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export { signToken as s, verifyToken as v };
//# sourceMappingURL=jwt.mjs.map
