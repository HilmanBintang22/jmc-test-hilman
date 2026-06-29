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
  const [existing] = await pool.query("SELECT nama_pegawai FROM pegawai WHERE id = ?", [id]);
  const rows = existing;
  if (rows.length === 0) {
    throw createError({ statusCode: 404, message: "Pegawai tidak ditemukan" });
  }
  await pool.query("DELETE FROM pegawai WHERE id = ?", [id]);
  await logActivity(event, "Hapus Pegawai", `Menghapus pegawai ${rows[0].nama_pegawai}`, auth == null ? void 0 : auth.id);
  return { success: true, message: "Pegawai berhasil dihapus" };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
