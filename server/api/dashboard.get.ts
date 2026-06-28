import { defineEventHandler } from "h3"
import pool from "../utils/db"

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    return { success: true, data: { role: "guest", greeting: "Selamat Datang" } }
  }

  const totalPegawai = (await pool.query("SELECT COUNT(*) as total FROM pegawai"))[0] as any[]

  let kontrak = 0, tetap = 0, magang = 0
  try {
    const [kontrakRows] = await pool.query(
      "SELECT jenis_kontrak, COUNT(*) as total FROM pegawai GROUP BY jenis_kontrak"
    ) as any[]
    for (const row of kontrakRows) {
      if (row.jenis_kontrak === 'PKWT') kontrak = row.total
      else if (row.jenis_kontrak === 'PKWTT') tetap = row.total
      else if (row.jenis_kontrak === 'Magang') magang = row.total
    }
  } catch {
    // kolom jenis_kontrak belum ada — fallback ke query lama
    const [statusRows] = await pool.query(
      "SELECT p.status, COUNT(*) as total FROM pegawai p GROUP BY p.status"
    ) as any[]
    for (const row of statusRows) {
      if (row.status === 'Aktif') tetap = row.total
    }
  }

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
        kontrak,
        tetap,
        magang,
        pria: 0,
        wanita: 0,
        perJabatan,
      },
      pegawaiTerbaru,
    },
  }
})
