import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { d as defineEventHandler, f as getQuery, q as setHeader } from '../../../_/nitro.mjs';
import { p as pool } from '../../../_/db.mjs';
import { createRequire } from 'node:module';
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

const require$1 = createRequire(globalThis._importMeta_.url);
const XLSX = require$1("xlsx");
const pegawai_xlsx_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  let sql = `
    SELECT p.nip, p.nama_pegawai as nama, p.email, p.nomor_hp,
           mj.nama as jabatan, md.nama as departemen,
           p.tanggal_masuk, p.status
    FROM pegawai p
    LEFT JOIN master_data mj ON p.id_jabatan = mj.id
    LEFT JOIN master_data md ON p.id_departemen = md.id
    WHERE 1=1
  `;
  const params = [];
  if (query.ids) {
    const ids = String(query.ids).split(",").map(Number);
    sql += ` AND p.id IN (${ids.map(() => "?").join(",")})`;
    params.push(...ids);
  }
  sql += " ORDER BY p.nama_pegawai";
  const [rows] = await pool.query(sql, params);
  const data = rows;
  const wb = XLSX.utils.book_new();
  const wsData = [
    ["No", "NIP", "Nama", "Email", "No HP", "Jabatan", "Departemen", "Tanggal Masuk", "Status"],
    ...data.map((p, i) => [
      i + 1,
      p.nip || "",
      p.nama || "",
      p.email || "",
      p.nomor_hp || "",
      p.jabatan || "",
      p.departemen || "",
      p.tanggal_masuk ? new Date(p.tanggal_masuk).toLocaleDateString("id-ID") : "",
      p.status || ""
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  setHeader(event, "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  setHeader(event, "Content-Disposition", "attachment; filename=daftar-pegawai.xlsx");
  return buf;
});

export { pegawai_xlsx_get as default };
//# sourceMappingURL=pegawai.xlsx.get.mjs.map
