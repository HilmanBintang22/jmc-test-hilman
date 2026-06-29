import { d as defineEventHandler } from '../../_/nitro.mjs';
import { p as pool } from '../../_/db.mjs';
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

const role_get = defineEventHandler(async () => {
  const [rows] = await pool.query("SELECT id, nama_role, created_at FROM user_role ORDER BY id");
  return { success: true, data: rows };
});

export { role_get as default };
//# sourceMappingURL=role.get.mjs.map
