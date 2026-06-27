import { defineEventHandler, getHeader, createError } from "h3"
import { verifyToken } from "../../utils/jwt"
import pool from "../../utils/db"

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded: any = verifyToken(token)

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nama, u.disabled, ur.nama_role
       FROM user u
       LEFT JOIN user_role ur ON u.id_role = ur.id
       WHERE u.id = ?`,
      [decoded.id],
    )

    const user = (rows as any[])[0]
    if (!user || user.disabled) {
      throw createError({ statusCode: 401, message: "Akun dinonaktifkan" })
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.nama_role,
      },
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 401, message: "Token invalid atau expired" })
  }
})
