import { d as defineEventHandler, l as getRouterParam, c as createError } from '../../../../_/nitro.mjs';
import { p as pool } from '../../../../_/db.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:process';
import 'jsonwebtoken';

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || !id.includes("-")) {
    throw createError({ statusCode: 400, message: "Format ID tidak valid (tahun-bulan)" });
  }
  const [year, month] = id.split("-");
  const [rows] = await pool.query(
    `SELECT tt.id, p.nama_pegawai as nama, tt.km, tt.hari_kerja, tt.nominal
     FROM tunjangan_transport tt
     LEFT JOIN pegawai p ON tt.id_pegawai = p.id
     WHERE tt.tahun = ? AND tt.bulan = ?
     ORDER BY p.nama_pegawai`,
    [Number(year), Number(month)]
  );
  const bulanIndo = [
    "",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  return {
    success: true,
    data: {
      bulan: `${bulanIndo[Number(month)]} ${year}`,
      tahun: Number(year),
      bulan_num: Number(month),
      penerima: rows
    }
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
