import { d as defineEventHandler, c as createError } from '../../../_/nitro.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.nama, u.email, u.last_login, u.disabled,
            ur.nama_role, u.id_role
     FROM user u
     LEFT JOIN user_role ur ON u.id_role = ur.id
     WHERE u.id = ?`,
    [auth.id]
  );
  const user = rows[0];
  if (!user) {
    throw createError({ statusCode: 404, message: "User tidak ditemukan" });
  }
  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      nama: user.nama,
      email: user.email,
      role: user.nama_role,
      id_role: user.id_role,
      last_login: user.last_login
    }
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
