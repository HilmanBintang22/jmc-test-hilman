import { d as defineEventHandler, l as getRouterParam, r as readBody, c as createError } from '../../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
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

const _id__put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const auth = event.context.auth;
  const [existing] = await pool.query("SELECT id FROM user WHERE id = ?", [id]);
  if (existing.length === 0) {
    throw createError({ statusCode: 404, message: "User tidak ditemukan" });
  }
  const updates = [];
  const params = [];
  if (body.id_role !== void 0) {
    updates.push("id_role=?");
    params.push(body.id_role);
  }
  if (body.id_pegawai !== void 0) {
    updates.push("id_pegawai=?");
    params.push(body.id_pegawai);
  }
  if (body.id_jabatan !== void 0) {
    updates.push("id_jabatan=?");
    params.push(body.id_jabatan);
  }
  if (body.id_departemen !== void 0) {
    updates.push("id_departemen=?");
    params.push(body.id_departemen);
  }
  if (body.username !== void 0) {
    updates.push("username=?");
    params.push(body.username);
  }
  if (body.nama !== void 0) {
    updates.push("nama=?");
    params.push(body.nama);
  }
  if (body.email !== void 0) {
    updates.push("email=?");
    params.push(body.email);
  }
  if (body.disabled !== void 0) {
    updates.push("disabled=?");
    params.push(body.disabled ? 1 : 0);
  }
  if (body.password) {
    const hash = await bcrypt.hash(body.password, 10);
    updates.push("password_hash=?");
    params.push(hash);
  }
  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: "Tidak ada data yang diupdate" });
  }
  params.push(id);
  await pool.execute(`UPDATE user SET ${updates.join(", ")} WHERE id=?`, params);
  await logActivity(event, "Ubah User", `Mengubah data user ID ${id}`, auth == null ? void 0 : auth.id);
  return { success: true, message: "User berhasil diupdate" };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
