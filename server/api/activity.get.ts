import { defineEventHandler, getQuery } from "h3"
import pool from "../utils/db"
import { parsePagination } from "../utils/helpers"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, offset } = parsePagination(query)

  let where = "WHERE 1=1"
  const params: any[] = []

  const joinQuery = "LEFT JOIN user u ON a.created_by = u.id"

  if (query.search) {
    where += " AND (a.title LIKE ? OR a.content LIKE ? OR u.nama LIKE ?)"
    const s = `%${query.search}%`
    params.push(s, s, s)
  }

  const countRows = (await pool.query(`SELECT COUNT(*) as total FROM activities a ${joinQuery} ${where}`, params))[0] as any[]
  const total = countRows[0].total

  const [rows] = await pool.query(
    `SELECT a.id, a.title, a.content, a.ip, a.url, a.browser, a.platform, a.created_at,
            u.nama as user_name
     FROM activities a
     ${joinQuery}
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  return {
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
})
