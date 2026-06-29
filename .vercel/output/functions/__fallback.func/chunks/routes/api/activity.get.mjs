import { d as defineEventHandler, f as getQuery, c as createError } from '../../_/nitro.mjs';
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

const activity_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 15;
  const search = query.search || "";
  const offset = (page - 1) * limit;
  try {
    let whereClause = "WHERE 1=1";
    const queryParams = [];
    if (search) {
      whereClause += " AND (u.username LIKE ? OR a.title LIKE ? OR a.content LIKE ? OR a.ip LIKE ?)";
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM activities a
      LEFT JOIN user u ON a.created_by = u.id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, queryParams);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    const dataQuery = `
      SELECT a.*, u.username as user_name 
      FROM activities a
      LEFT JOIN user u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const finalParams = [...queryParams, limit, offset];
    const [rows] = await pool.query(dataQuery, finalParams);
    return {
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Gagal mengambil data log aktivitas: " + error.message
    });
  }
});

export { activity_get as default };
//# sourceMappingURL=activity.get.mjs.map
