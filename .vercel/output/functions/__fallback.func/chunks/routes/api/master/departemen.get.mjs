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

const departemen_get = defineEventHandler(async () => {
  const [rows] = await pool.query("SELECT id, nama FROM master_data WHERE tipe = 'departemen' ORDER BY nama");
  return { success: true, data: rows };
});

export { departemen_get as default };
//# sourceMappingURL=departemen.get.mjs.map
