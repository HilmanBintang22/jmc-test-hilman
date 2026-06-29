import { d as defineEventHandler, f as getQuery } from '../../../_/nitro.mjs';
import { p as pool } from '../../../_/db.mjs';
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

const transport_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = Number(query.tahun) || (/* @__PURE__ */ new Date()).getFullYear();
  const [rows] = await pool.query(
    `SELECT tt.bulan, tt.tahun,
            COUNT(DISTINCT tt.id_pegawai) as total_penerima,
            SUM(tt.nominal) as total_nominal
     FROM tunjangan_transport tt
     WHERE tt.tahun = ?
     GROUP BY tt.tahun, tt.bulan
     ORDER BY tt.bulan`,
    [tahun]
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
  const existingData = rows.reduce((acc, r) => {
    acc[r.bulan] = r;
    return acc;
  }, {});
  const data = [];
  for (let b = 1; b <= 12; b++) {
    const existing = existingData[b];
    data.push({
      id: `${tahun}-${String(b).padStart(2, "0")}`,
      bulan: `${bulanIndo[b]} ${tahun}`,
      total_penerima: existing ? Number(existing.total_penerima) : 0,
      total_nominal: existing ? Number(existing.total_nominal) : 0,
      sudah_dihitung: !!existing
    });
  }
  return { success: true, data };
});

export { transport_get as default };
//# sourceMappingURL=transport.get.mjs.map
