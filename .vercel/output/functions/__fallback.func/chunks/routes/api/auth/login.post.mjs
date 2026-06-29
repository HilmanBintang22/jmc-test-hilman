import { d as defineEventHandler, r as readBody, c as createError, s as setCookie } from '../../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
import { p as pool } from '../../../_/db.mjs';
import { s as signToken } from '../../../_/jwt.mjs';
import { l as logActivity } from '../../../_/activity.mjs';
import process from 'node:process';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'jsonwebtoken';
import '../../../_/helpers.mjs';

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const username = body.username;
  const password = body.password;
  const recaptchaToken = body.recaptchaToken || body.captcha || body.token;
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username dan password wajib diisi"
    });
  }
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaToken && secretKey) {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    try {
      const captchaRes = await fetch(verifyUrl, { method: "POST" });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        throw createError({
          statusCode: 400,
          message: "Verifikasi captcha gagal, silakan coba lagi"
        });
      }
    } catch (err) {
      console.error("Gagal menghubungi server Google reCAPTCHA:", err);
    }
  } else if (!secretKey) {
    console.warn("Peringatan: RECAPTCHA_SECRET_KEY tidak ditemukan di file .env Anda.");
  }
  const [rows] = await pool.query(
    `SELECT u.*, p.nama_pegawai, p.nomor_hp FROM user u 
     LEFT JOIN pegawai p ON u.id_pegawai = p.id 
     WHERE (u.username = ? OR u.email = ? OR p.nomor_hp = ?) AND u.disabled = 0`,
    [username, username, username]
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
    nama: user.nama || user.nama_pegawai
  });
  console.log("\u{1F510} JWT created:", token);
  await pool.execute(
    "UPDATE user SET last_login = NOW(), last_session = ? WHERE id = ?",
    [token, user.id]
  );
  setCookie(event, "auth_session", token, {
    httpOnly: false,
    secure: true,
    maxAge: 60 * 60 * 8,
    // Aktif selama 8 jam
    path: "/",
    sameSite: "lax"
  });
  const [permRows] = await pool.query(
    "SELECT modul_fitur, akses, `create`, `read`, `update`, `delete` FROM role_permission WHERE id_role = ?",
    [user.id_role]
  );
  await logActivity(event, "Login Aplikasi", `User ${user.username} login ke sistem`, user.id);
  return {
    success: true,
    token,
    user: {
      id: user.id,
      nama: user.nama || user.nama_pegawai,
      username: user.username,
      role: user.nama_role,
      id_role: user.id_role
    },
    permissions: permRows
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
