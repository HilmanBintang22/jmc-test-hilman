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

const setting_put = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const auth = event.context.auth;
  if (!body.base_fare || !body.berlaku_mulai) {
    throw createError({ statusCode: 400, message: "Base fare dan berlaku mulai wajib diisi" });
  }
  await pool.execute(
    "INSERT INTO tunjangan_setting (base_fare, berlaku_mulai, min_km, max_km) VALUES (?, ?, ?, ?)",
    [body.base_fare, body.berlaku_mulai, body.min_km || 5, body.max_km || 25]
  );
  await logActivity(event, "Setting Tunjangan", "Mengupdate setting tunjangan transport", auth == null ? void 0 : auth.id);
  return { success: true, message: "Setting tunjangan berhasil disimpan" };
});

export { setting_put as default };
//# sourceMappingURL=setting.put.mjs.map
