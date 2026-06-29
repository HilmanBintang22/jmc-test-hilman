import { d as defineEventHandler, g as getHeader, c as createError } from '../../../_/nitro.mjs';
import { v as verifyToken } from '../../../_/jwt.mjs';
import { p as pool } from '../../../_/db.mjs';
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

const verify_get = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const [rows] = await pool.query(
      `SELECT u.id, u.id_role, u.username, u.nama, u.disabled, ur.nama_role
       FROM user u
       LEFT JOIN user_role ur ON u.id_role = ur.id
       WHERE u.id = ?`,
      [decoded.id]
    );
    const user = rows[0];
    if (!user || user.disabled) {
      throw createError({ statusCode: 401, message: "Akun dinonaktifkan" });
    }
    const [permRows] = await pool.query(
      "SELECT modul_fitur, akses, `create`, `read`, `update`, `delete` FROM role_permission WHERE id_role = ?",
      [user.id_role]
    );
    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.nama_role,
        id_role: user.id_role
      },
      permissions: permRows
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 401, message: "Token invalid atau expired" });
  }
});

export { verify_get as default };
//# sourceMappingURL=verify.get.mjs.map
