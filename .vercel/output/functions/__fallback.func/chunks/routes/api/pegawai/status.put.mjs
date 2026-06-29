import { d as defineEventHandler, r as readBody, c as createError } from '../../../_/nitro.mjs';
import { p as pool } from '../../../_/db.mjs';
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
import '../../../_/helpers.mjs';

const status_put = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const auth = event.context.auth;
  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, message: "ID pegawai harus diisi" });
  }
  if (!["Aktif", "Nonaktif"].includes(body.status)) {
    throw createError({ statusCode: 400, message: "Status harus Aktif atau Nonaktif" });
  }
  const placeholders = body.ids.map(() => "?").join(",");
  await pool.execute(
    `UPDATE pegawai SET status = ? WHERE id IN (${placeholders})`,
    [body.status, ...body.ids]
  );
  await logActivity(
    event,
    `${body.status === "Aktif" ? "Aktifkan" : "Nonaktifkan"} Pegawai`,
    `${body.status === "Aktif" ? "Mengaktifkan" : "Menonaktifkan"} ${body.ids.length} pegawai`,
    auth == null ? void 0 : auth.id
  );
  return { success: true, message: `Status ${body.ids.length} pegawai berhasil diupdate` };
});

export { status_put as default };
//# sourceMappingURL=status.put.mjs.map
