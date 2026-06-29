import { d as defineEventHandler, f as getQuery } from '../../../_/nitro.mjs';
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

const wilayah_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  let sql = "SELECT id, kecamatan, kabupaten, provinsi FROM master_wilayah";
  const params = [];
  if (query.search) {
    sql += " WHERE kecamatan LIKE ?";
    params.push(`%${query.search}%`);
  }
  sql += " ORDER BY kecamatan LIMIT 50";
  const [rows] = await pool.query(sql, params);
  return { success: true, data: rows };
});

export { wilayah_get as default };
//# sourceMappingURL=wilayah.get.mjs.map
