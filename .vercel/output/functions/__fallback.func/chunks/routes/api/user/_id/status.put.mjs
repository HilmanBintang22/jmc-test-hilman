import { d as defineEventHandler, l as getRouterParam, r as readBody, c as createError } from '../../../../_/nitro.mjs';
import { p as pool } from '../../../../_/db.mjs';
import { l as logActivity } from '../../../../_/activity.mjs';
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
import '../../../../_/helpers.mjs';

const status_put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const auth = event.context.auth;
  if (body.disabled === void 0) {
    throw createError({ statusCode: 400, message: "Field disabled wajib diisi" });
  }
  await pool.execute("UPDATE user SET disabled = ? WHERE id = ?", [body.disabled ? 1 : 0, id]);
  await logActivity(
    event,
    body.disabled ? "Nonaktifkan User" : "Aktifkan User",
    `${body.disabled ? "Menonaktifkan" : "Mengaktifkan"} user ID ${id}`,
    auth == null ? void 0 : auth.id
  );
  return { success: true, message: "Status user berhasil diupdate" };
});

export { status_put as default };
//# sourceMappingURL=status.put.mjs.map
