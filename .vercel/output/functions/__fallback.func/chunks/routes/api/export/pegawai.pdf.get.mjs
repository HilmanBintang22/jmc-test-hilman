import { d as defineEventHandler, f as getQuery, q as setHeader } from '../../../_/nitro.mjs';
import { p as pool } from '../../../_/db.mjs';
import pdfmake from 'pdfmake';
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

const pegawai_pdf_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  let sql = `
    SELECT p.nip, p.nama_pegawai as nama, mj.nama as jabatan, md.nama as departemen,
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
  const printer = new pdfmake({
    Roboto: {
      normal: "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
      bold: "node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff"
    }
  });
  const docDef = {
    content: [
      { text: "Daftar Pegawai", style: "header" },
      { text: `
Tanggal: ${(/* @__PURE__ */ new Date()).toLocaleDateString("id-ID")}

` },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto"],
          body: [
            ["No", "NIP", "Nama", "Jabatan", "Departemen", "Status"],
            ...data.map((p, i) => [
              i + 1,
              p.nip || "-",
              p.nama || "-",
              p.jabatan || "-",
              p.departemen || "-",
              p.status || "-"
            ])
          ]
        }
      }
    ],
    styles: {
      header: { fontSize: 16, bold: true }
    }
  };
  const pdfDoc = printer.createPdfKitDocument(docDef);
  const chunks = [];
  return new Promise((resolve) => {
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      setHeader(event, "Content-Type", "application/pdf");
      setHeader(event, "Content-Disposition", "attachment; filename=daftar-pegawai.pdf");
      resolve(pdfBuffer);
    });
    pdfDoc.end();
  });
});

export { pegawai_pdf_get as default };
//# sourceMappingURL=pegawai.pdf.get.mjs.map
