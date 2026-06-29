import { d as defineEventHandler, l as getRouterParam, c as createError } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const [role] = await pool.query("SELECT id, nama_role, created_at FROM user_role WHERE id = ?", [id]);
  const roleRows = role;
  if (roleRows.length === 0) {
    throw createError({ statusCode: 404, message: "Role tidak ditemukan" });
  }
  const [permissions] = await pool.query(
    "SELECT id, modul_fitur, akses, `create`, `read`, `update`, `delete` FROM role_permission WHERE id_role = ?",
    [id]
  );
  return { success: true, data: { ...roleRows[0], permissions } };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
