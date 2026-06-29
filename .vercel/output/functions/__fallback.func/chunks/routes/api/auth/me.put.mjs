import { d as defineEventHandler, c as createError, r as readBody } from '../../../_/nitro.mjs';
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

const me_put = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const body = await readBody(event);
  const updates = [];
  const params = [];
  if (body.nama !== void 0) {
    if (typeof body.nama !== "string" || !body.nama.trim()) {
      throw createError({ statusCode: 400, message: "Nama tidak boleh kosong" });
    }
    updates.push("nama=?");
    params.push(body.nama.trim());
  }
  if (body.email !== void 0) {
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw createError({ statusCode: 400, message: "Format email tidak valid" });
    }
    updates.push("email=?");
    params.push(body.email || null);
  }
  if (body.password) {
    if (body.password.length < 8) {
      throw createError({ statusCode: 400, message: "Password minimal 8 karakter" });
    }
    if (/\s/.test(body.password)) {
      throw createError({ statusCode: 400, message: "Password tidak boleh mengandung spasi" });
    }
    if (!/[A-Z]/.test(body.password)) {
      throw createError({ statusCode: 400, message: "Password harus mengandung huruf besar" });
    }
    if (!/[a-z]/.test(body.password)) {
      throw createError({ statusCode: 400, message: "Password harus mengandung huruf kecil" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(body.password)) {
      throw createError({ statusCode: 400, message: "Password harus mengandung karakter khusus" });
    }
    const hash = await bcrypt.hash(body.password, 10);
    updates.push("password_hash=?");
    params.push(hash);
  }
  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: "Tidak ada data yang diubah" });
  }
  params.push(auth.id);
  await pool.execute(`UPDATE user SET ${updates.join(", ")} WHERE id=?`, params);
  await logActivity(event, "Update Profil", `User ${auth.nama} mengupdate profil`, auth.id);
  return { success: true, message: "Profil berhasil diperbarui" };
});

export { me_put as default };
//# sourceMappingURL=me.put.mjs.map
