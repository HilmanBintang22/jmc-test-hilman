import { d as defineEventHandler, l as getRouterParam, c as createError } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = event.context.auth;
  if ((auth == null ? void 0 : auth.id) && String(auth.id) === String(id)) {
    throw createError({ statusCode: 403, message: "Tidak dapat menghapus akun diri sendiri" });
  }
  const [existing] = await pool.query("SELECT username FROM user WHERE id = ?", [id]);
  if (existing.length === 0) {
    throw createError({ statusCode: 404, message: "User tidak ditemukan" });
  }
  await pool.execute("DELETE FROM user WHERE id = ?", [id]);
  await logActivity(event, "Hapus User", `Menghapus user ID ${id}`, auth == null ? void 0 : auth.id);
  return { success: true, message: "User berhasil dihapus" };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
