import { d as defineEventHandler, g as getHeader, c as createError } from '../../../_/nitro.mjs';
import { v as verifyToken } from '../../../_/jwt.mjs';
import { l as logActivity } from '../../../_/activity.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:process';
import 'jsonwebtoken';
import '../../../_/db.mjs';
import '../../../_/helpers.mjs';

const logout_post = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw createError({ statusCode: 401, message: "Token invalid" });
  }
  await logActivity(event, "Logout", `User ${decoded.nama} logout`, decoded.id);
  return { success: true, message: "Logout berhasil" };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
