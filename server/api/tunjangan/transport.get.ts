import { defineEventHandler, getQuery } from "h3"
import pool from "../../utils/db"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let sql = `
    SELECT tt.bulan, tt.tahun,
           COUNT(DISTINCT tt.id_pegawai) as total_penerima,
           SUM(tt.nominal) as total_nominal
    FROM tunjangan_transport tt
  `
  const params: any[] = []
  const conditions: string[] = []

  if (query.tahun) {
    conditions.push("tt.tahun = ?")
    params.push(Number(query.tahun))
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  sql += " GROUP BY tt.tahun, tt.bulan ORDER BY tt.tahun DESC, tt.bulan DESC"

  const [rows] = await pool.query(sql, params)

  const bulanIndo = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  const data = (rows as any[]).map((r: any) => ({
    id: `${r.tahun}-${String(r.bulan).padStart(2, "0")}`,
    bulan: `${bulanIndo[r.bulan]} ${r.tahun}`,
    total_penerima: r.total_penerima,
    total_nominal: r.total_nominal,
  }))

  return { success: true, data }
})
