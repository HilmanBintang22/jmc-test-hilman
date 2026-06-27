import { defineEventHandler, getRouterParam, getQuery, createError } from "h3"
import pool from "../../../utils/db"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const [year, month] = id!.split("-")

  const [rows] = await pool.query(
    `SELECT tt.id, p.nama_pegawai as nama, tt.km, tt.hari_kerja, tt.nominal
     FROM tunjangan_transport tt
     LEFT JOIN pegawai p ON tt.id_pegawai = p.id
     WHERE tt.tahun = ? AND tt.bulan = ?
     ORDER BY p.nama_pegawai`,
    [Number(year), Number(month)],
  )

  const data = rows as any[]
  if (data.length === 0) {
    throw createError({ statusCode: 404, message: "Data tunjangan tidak ditemukan" })
  }

  const bulanIndo = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  return {
    success: true,
    data: {
      bulan: `${bulanIndo[Number(month)]} ${year}`,
      tahun: Number(year),
      bulan_num: Number(month),
      penerima: data,
    },
  }
})
