import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

const buildPath = path.join(__dirname, 'dist')
const publicPath = path.join(__dirname, 'public')
const clientPath = fs.existsSync(buildPath) ? buildPath : publicPath

app.use(cors())
app.use(express.json())
app.use(express.static(clientPath))

app.post('/api/registration', async (req, res) => {
  const { namaAnak, usiaAnak, namaOrangTua, nomorHp, email, catatan } = req.body

  if (!namaAnak || !usiaAnak || !namaOrangTua || !nomorHp || !email) {
    return res.status(400).json({ message: 'Semua data wajib diisi.' })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.REGISTRATION_EMAIL,
      subject: `Pendaftaran Baru - ${namaAnak}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #22c55e, #15803d); color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px;">Pendaftaran Baru TK Bhakti Pertiwi Cimalaka</h2>
            <p style="margin: 8px 0 0; opacity: 0.95;">Permintaan pendaftaran anak baru telah masuk.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 160px; color: #374151;">Nama Anak</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaAnak}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Usia Anak</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${usiaAnak} tahun</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nama Orang Tua</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaOrangTua}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nomor HP</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nomorHp}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Catatan</td>
              <td style="padding: 12px 16px; color: #111827;">${catatan || '-'}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">Email ini dikirim otomatis dari sistem pendaftaran online TK Bhakti Pertiwi Cimalaka.</p>
        </div>
      `,
    })

    return res.json({ success: true, message: 'Pendaftaran berhasil dikirim ke email sekolah.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Gagal mengirim email. Cek konfigurasi SMTP.' })
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})
