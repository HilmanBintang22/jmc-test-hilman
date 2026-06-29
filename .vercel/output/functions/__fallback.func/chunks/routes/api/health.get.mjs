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

const health_get = defineEventHandler(async () => {
  var _a;
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    const dbOk = ((_a = rows[0]) == null ? void 0 : _a.ok) === 1;
    return {
      success: true,
      data: {
        status: dbOk ? "healthy" : "unhealthy",
        database: dbOk ? "connected" : "disconnected",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  } catch (err) {
    return {
      success: false,
      data: {
        status: "unhealthy",
        database: "disconnected",
        error: err.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
});

export { health_get as default };
//# sourceMappingURL=health.get.mjs.map
