import { defineEventHandler, readBody, createError } from "h3"
import pool from "../utils/db"
import { logActivity } from "../utils/activity"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const auth = event.context.auth

  if (!body.nip || !body.nama_pegawai) {
    throw createError({ statusCode: 400, message: "NIP dan Nama wajib diisi" })
  }
  if (!/^\d{8,}$/.test(body.nip)) {
    throw createError({ statusCode: 400, message: "NIP minimal 8 digit angka" })
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({ statusCode: 400, message: "Format email tidak valid" })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [result] = await conn.execute(
      `INSERT INTO pegawai (foto_pegawai, nip, nama_pegawai, email, nomor_hp, tempat_lahir,
        id_kecamatan, alamat_lengkap, jarak_rumah_kantor, tanggal_lahir, status_kawin,
        jumlah_anak, tanggal_masuk, id_jabatan, id_departemen, usia, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.foto_pegawai || null,
        body.nip,
        body.nama_pegawai,
        body.email || null,
        body.nomor_hp || null,
        body.tempat_lahir || null,
        body.id_kecamatan || null,
        body.alamat_lengkap || null,
        body.jarak_rumah_kantor || null,
        body.tanggal_lahir || null,
        body.status_kawin || null,
        body.jumlah_anak || 0,
        body.tanggal_masuk || null,
        body.id_jabatan || null,
        body.id_departemen || null,
        body.usia || null,
        body.status || "Aktif",
      ],
    )

    const idPegawai = (result as any).insertId

    if (body.pendidikan && Array.isArray(body.pendidikan)) {
      for (const p of body.pendidikan) {
        if (p.tingkat_pendidikan || p.nama_sekolah) {
          await conn.execute(
            "INSERT INTO pegawai_pendidikan (id_pegawai, tingkat_pendidikan, nama_sekolah, tahun_lulus) VALUES (?, ?, ?, ?)",
            [idPegawai, p.tingkat_pendidikan, p.nama_sekolah, p.tahun_lulus || null],
          )
        }
      }
    }

    await conn.commit()

    await logActivity(event, "Tambah Pegawai", `Menambahkan pegawai ${body.nama_pegawai} (NIP: ${body.nip})`, auth?.id)

    return { success: true, message: "Pegawai berhasil ditambahkan", data: { id: idPegawai } }
  } catch (err: any) {
    await conn.rollback()
    if (err.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, message: "NIP atau Email sudah terdaftar" })
    }
    throw createError({ statusCode: 500, message: "Gagal menyimpan data" })
  } finally {
    conn.release()
  }
})
