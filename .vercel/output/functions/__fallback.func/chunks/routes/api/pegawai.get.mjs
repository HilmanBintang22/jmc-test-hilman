import { d as defineEventHandler, f as getQuery } from '../../_/nitro.mjs';
import { p as pool } from '../../_/db.mjs';
import { p as parsePagination } from '../../_/helpers.mjs';
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

const pegawai_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { page, limit, offset } = parsePagination(query);
  let where = "WHERE 1=1";
  const params = [];
  if (query.search) {
    where += " AND (p.nama_pegawai LIKE ? OR p.nip LIKE ? OR mj.nama LIKE ?)";
    const s = `%${query.search}%`;
    params.push(s, s, s);
  }
  if (query.jabatan) {
    const jabatanIds = String(query.jabatan).split(",").map(Number).filter(Boolean);
    if (jabatanIds.length > 0) {
      where += " AND p.id_jabatan IN (" + jabatanIds.map(() => "?").join(",") + ")";
      params.push(...jabatanIds);
    }
  }
  if (query.departemen) {
    where += " AND p.id_departemen = ?";
    params.push(Number(query.departemen));
  }
  if (query.status) {
    where += " AND p.status = ?";
    params.push(query.status);
  }
  if (query.jenis_kontrak) {
    where += " AND p.jenis_kontrak = ?";
    params.push(query.jenis_kontrak);
  }
  if (query.masa_kerja_min) {
    where += " AND TIMESTAMPDIFF(YEAR, p.tanggal_masuk, CURDATE()) >= ?";
    params.push(Number(query.masa_kerja_min));
  }
  if (query.masa_kerja_max) {
    where += " AND TIMESTAMPDIFF(YEAR, p.tanggal_masuk, CURDATE()) <= ?";
    params.push(Number(query.masa_kerja_max));
  }
  const countSql = `SELECT COUNT(*) as total FROM pegawai p LEFT JOIN master_data mj ON p.id_jabatan = mj.id ${where}`;
  const countRows = (await pool.query(countSql, params))[0];
  const total = countRows[0].total;
  const dataSql = `
    SELECT p.id, p.nip, p.nama_pegawai as nama, p.email, p.nomor_hp, p.foto_pegawai as foto,
           mj.nama as jabatan, md.nama as departemen,
           p.tanggal_masuk, p.status, p.jenis_kontrak, p.tempat_lahir, p.tanggal_lahir, p.usia,
           p.status_kawin, p.jumlah_anak, p.alamat_lengkap, p.jarak_rumah_kantor,
           TIMESTAMPDIFF(YEAR, p.tanggal_masuk, CURDATE()) as masa_kerja_tahun,
           TIMESTAMPDIFF(MONTH, p.tanggal_masuk, CURDATE()) % 12 as masa_kerja_bulan
    FROM pegawai p
    LEFT JOIN master_data mj ON p.id_jabatan = mj.id
    LEFT JOIN master_data md ON p.id_departemen = md.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  const [rows] = await pool.query(dataSql, params);
  return {
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
});

export { pegawai_get as default };
//# sourceMappingURL=pegawai.get.mjs.map
