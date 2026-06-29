import { d as defineEventHandler, o as readMultipartFormData, c as createError } from '../../../_/nitro.mjs';
import { v2 } from 'cloudinary';
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

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadFoto_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readMultipartFormData(event);
  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Tidak ada file yang diupload"
    });
  }
  const file = body[0];
  if (!file.filename) {
    throw createError({
      statusCode: 400,
      message: "Nama file tidak ditemukan"
    });
  }
  const ext = (_a = file.filename.split(".").pop()) == null ? void 0 : _a.toLowerCase();
  if (!["jpg", "jpeg", "png"].includes(ext || "")) {
    throw createError({
      statusCode: 400,
      message: "Format file harus JPG, JPEG, atau PNG"
    });
  }
  const uploadResult = await new Promise((resolve, reject) => {
    v2.uploader.upload_stream(
      {
        folder: "pegawai"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file.data);
  });
  return {
    success: true,
    data: {
      url: uploadResult.secure_url
    }
  };
});

export { uploadFoto_post as default };
//# sourceMappingURL=upload-foto.post.mjs.map
