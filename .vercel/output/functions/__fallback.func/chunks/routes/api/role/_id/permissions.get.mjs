import { d as defineEventHandler, l as getRouterParam } from '../../../../_/nitro.mjs';
import { p as pool } from '../../../../_/db.mjs';
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

const permissions_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const [rows] = await pool.query(
    "SELECT id, modul_fitur, akses, `create`, `read`, `update`, `delete` FROM role_permission WHERE id_role = ?",
    [id]
  );
  return { success: true, data: rows };
});

export { permissions_get as default };
//# sourceMappingURL=permissions.get.mjs.map
