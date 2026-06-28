import { verifyToken } from "../utils/jwt"
import { defineEventHandler, getHeader, createError } from "h3"
import pool from "../utils/db"
import { enforcePermission } from "../utils/permission"

const publicRoutes = ["/api/auth/login", "/api/auth/logout", "/api/auth/verify", "/api/health"]

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api/")) return
  if (publicRoutes.includes(event.path)) return

  const authHeader = getHeader(event, "authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  let decoded: any
  try {
    decoded = verifyToken(token) as any
  } catch {
    throw createError({ statusCode: 401, message: "Token invalid atau expired" })
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.id_role, u.disabled, ur.nama_role
     FROM user u
     LEFT JOIN user_role ur ON u.id_role = ur.id
     WHERE u.id = ?`,
    [decoded.id],
  )

  const user = (rows as any[])[0]
  if (!user || user.disabled) {
    throw createError({ statusCode: 401, message: "Akun dinonaktifkan" })
  }

  event.context.auth = {
    id: user.id,
    id_role: user.id_role,
    nama_role: user.nama_role,
    username: decoded.username,
    nama: decoded.nama,
  }

  await enforcePermission(event, user.id_role)
})
