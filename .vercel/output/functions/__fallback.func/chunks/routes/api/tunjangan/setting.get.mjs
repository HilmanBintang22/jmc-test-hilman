import { d as defineEventHandler } from '../../../_/nitro.mjs';
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

const setting_get = defineEventHandler(async () => {
  const [rows] = await pool.query("SELECT * FROM tunjangan_setting ORDER BY id DESC LIMIT 1");
  return { success: true, data: rows[0] || null };
});

export { setting_get as default };
//# sourceMappingURL=setting.get.mjs.map
