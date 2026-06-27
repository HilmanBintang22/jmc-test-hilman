import { defineEventHandler } from "h3"
import pool from "../utils/db"

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    return { success: true, data: { role: "guest", greeting: "Selamat Datang" } }
  }

  const totalPegawai = (await pool.query("SELECT COUNT(*) as total FROM pegawai"))[0] as any[]
  const totalAktif = (await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status = 'Aktif'"))[0] as any[]
  const totalNonaktif = (await pool.query("SELECT COUNT(*) as total FROM pegawai WHERE status = 'Nonaktif'"))[0] as any[]

  const perJabatan = (await pool.query(
    "SELECT mj.nama, COUNT(*) as total FROM pegawai p LEFT JOIN master_data mj ON p.id_jabatan = mj.id GROUP BY mj.nama"
  ))[0] as any[]

  const pegawaiTerbaru = (await pool.query(
    "SELECT p.id, p.nip, p.nama_pegawai as nama, p.tanggal_masuk, p.status, p.foto_pegawai as foto FROM pegawai p ORDER BY p.created_at DESC LIMIT 5"
  ))[0] as any[]

  return {
    success: true,
    data: {
      role: auth.nama_role || "User",
      greeting: `Selamat Datang ${auth.nama}`,
      user: auth,
      statistik: {
        totalPegawai: totalPegawai[0].total,
        totalAktif: totalAktif[0].total,
        totalNonaktif: totalNonaktif[0].total,
        kontrak: 0,
        tetap: 0,
        magang: 0,
        pria: 0,
        wanita: 0,
        perJabatan,
      },
      pegawaiTerbaru,
    },
  }
})
