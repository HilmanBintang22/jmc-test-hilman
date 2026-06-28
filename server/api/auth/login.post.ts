import { defineEventHandler, readBody, createError } from "h3";
import bcrypt from "bcrypt";
import pool from "../../utils/db";
import { signToken } from "../../utils/jwt";
import { logActivity } from "../../utils/activity";
import process from "node:process";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, recaptchaToken } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username dan password wajib diisi",
    });
  }

  if (recaptchaToken) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
    const captchaRes = await fetch(verifyUrl, { method: "POST" })
    const captchaData = await captchaRes.json()
    if (!captchaData.success) {
      throw createError({
        statusCode: 400,
        message: "Verifikasi captcha gagal, silakan coba lagi",
      })
    }
  }

  const [rows]: any = await pool.query(
    `SELECT u.*, p.nama_pegawai, p.nomor_hp FROM user u 
     LEFT JOIN pegawai p ON u.id_pegawai = p.id 
     WHERE (u.username = ? OR u.email = ? OR p.nomor_hp = ?) AND u.disabled = 0`,
    [username, username, username],
  );

  if (rows.length === 0) {
    throw createError({ statusCode: 401, message: "Pengguna tidak ditemukan" });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createError({ statusCode: 401, message: "Password salah" });
  }

  const token = signToken({
    id: user.id,
    id_role: user.id_role,
    id_pegawai: user.id_pegawai,
    username: user.username,
    nama: user.nama || user.nama_pegawai,
  });

  const [permRows] = await pool.query(
    "SELECT modul_fitur, akses, `create`, `read`, `update`, `delete` FROM role_permission WHERE id_role = ?",
    [user.id_role],
  )

  await logActivity(event, "Login Aplikasi", `User ${user.username} login ke sistem`, user.id)

  return {
    success: true,
    token,
    user: {
      id: user.id,
      nama: user.nama || user.nama_pegawai,
      username: user.username,
      role: user.nama_role,
      id_role: user.id_role,
    },
    permissions: permRows,
  };
});
