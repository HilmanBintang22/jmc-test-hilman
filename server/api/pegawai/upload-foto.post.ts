import {
  defineEventHandler,
  readMultipartFormData,
  createError,
} from "h3"

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)

  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Tidak ada file yang diupload",
    })
  }

  const file = body[0]

  if (!file.filename) {
    throw createError({
      statusCode: 400,
      message: "Nama file tidak ditemukan",
    })
  }

  const ext = file.filename.split(".").pop()?.toLowerCase()

  if (!["jpg", "jpeg", "png"].includes(ext || "")) {
    throw createError({
      statusCode: 400,
      message: "Format file harus JPG, JPEG, atau PNG",
    })
  }

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "pegawai",
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      .end(file.data)
  })

  return {
    success: true,
    data: {
      url: uploadResult.secure_url,
    },
  }
})