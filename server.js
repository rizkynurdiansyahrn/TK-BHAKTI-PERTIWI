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
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465 (SMTPS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Allow self-signed certificates (helpful on some hosts)
      rejectUnauthorized: false,
    },
    connectionTimeout: 30_000,
  })

  // Debug log (without leaking credentials)
  console.log('SMTP config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.EMAIL_USER,
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
    console.error('SMTP sendMail failed:', error)

    // Jika ada API key Resend, coba kirim via Resend HTTP API (menghindari SMTP)
    if (process.env.RESEND_API_KEY) {
      try {
        const resendPayload = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: [process.env.REGISTRATION_EMAIL],
          subject: `Pendaftaran Baru - ${namaAnak}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
              <div style="background: linear-gradient(135deg, #22c55e, #15803d); color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 22px;">Pendaftaran Baru TK Bhakti Pertiwi Cimalaka</h2>
                <p style="margin: 8px 0 0; opacity: 0.95;">Permintaan pendaftaran anak baru telah masuk.</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 160px; color: #374151;">Nama Anak</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaAnak}</td></tr>
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Usia Anak</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${usiaAnak} tahun</td></tr>
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nama Orang Tua</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaOrangTua}</td></tr>
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nomor HP</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nomorHp}</td></tr>
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${email}</td></tr>
                <tr><td style="padding: 12px 16px; font-weight: bold; color: #374151;">Catatan</td><td style="padding: 12px 16px; color: #111827;">${catatan || '-'}</td></tr>
              </table>
            </div>
          `,
        }

        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        })

        if (!r.ok) {
          const t = await r.text()
          console.error('Resend HTTP error:', r.status, t)
          // lanjut ke fallback berikutnya
        } else {
          return res.json({ success: true, message: 'Pendaftaran berhasil dikirim via Resend.' })
        }
      } catch (resendErr) {
        console.error('Resend fallback failed:', resendErr)
        // lanjut ke fallback berikutnya
      }
    }

    // Jika ada API key SendGrid, coba fallback ke SendGrid API
    if (process.env.SENDGRID_API_KEY) {
      // Coba import resmi @sendgrid/mail bila tersedia
      try {
        const sgMailModule = await import('@sendgrid/mail')
        const sgMail = sgMailModule.default || sgMailModule
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        await sgMail.send({
          to: process.env.REGISTRATION_EMAIL,
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          subject: `Pendaftaran Baru - ${namaAnak}`,
          html: `...`,
        })

        return res.json({ success: true, message: 'Pendaftaran berhasil dikirim via SendGrid.' })
      } catch (sgErr) {
        console.warn('SendGrid SDK not available or failed, will try HTTP API:', sgErr)
        // Coba langsung ke HTTP API SendGrid tanpa dependency
        try {
          const sendgridPayload = {
            personalizations: [{ to: [{ email: process.env.REGISTRATION_EMAIL }] }],
            from: { email: process.env.EMAIL_FROM || process.env.EMAIL_USER },
            subject: `Pendaftaran Baru - ${namaAnak}`,
            content: [
              { type: 'text/html', value: `
                <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
                  <div style="background: linear-gradient(135deg, #22c55e, #15803d); color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 22px;">Pendaftaran Baru TK Bhakti Pertiwi Cimalaka</h2>
                    <p style="margin: 8px 0 0; opacity: 0.95;">Permintaan pendaftaran anak baru telah masuk.</p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 160px; color: #374151;">Nama Anak</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaAnak}</td></tr>
                    <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Usia Anak</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${usiaAnak} tahun</td></tr>
                    <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nama Orang Tua</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${namaOrangTua}</td></tr>
                    <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nomor HP</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nomorHp}</td></tr>
                    <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${email}</td></tr>
                    <tr><td style="padding: 12px 16px; font-weight: bold; color: #374151;">Catatan</td><td style="padding: 12px 16px; color: #111827;">${catatan || '-'}</td></tr>
                  </table>
                </div>
              ` },
            ],
          }

          const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendgridPayload),
          })

          if (!sgRes.ok) {
            const text = await sgRes.text()
            console.error('SendGrid HTTP error:', sgRes.status, text)
            return res.status(500).json({ message: 'Gagal mengirim email via SendGrid HTTP API.' })
          }

          return res.json({ success: true, message: 'Pendaftaran berhasil dikirim via SendGrid HTTP API.' })
        } catch (httpErr) {
          console.error('SendGrid HTTP fallback failed:', httpErr)
          return res.status(500).json({ message: 'Gagal mengirim email via SMTP dan SendGrid.' })
        }
      }
    }

    return res.status(500).json({ message: 'Gagal mengirim email. Cek konfigurasi SMTP.' })
  }
})

// Test endpoint: kirim email percobaan tanpa harus submit form
app.get('/api/test-email', async (req, res) => {
  const namaAnak = 'Tes Pengiriman'
  const usiaAnak = '0'
  const namaOrangTua = 'Automated Test'
  const nomorHp = '0000000000'
  const email = process.env.EMAIL_USER || 'no-reply@example.com'
  const catatan = 'Test email dari endpoint /api/test-email'

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30_000,
  })

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.REGISTRATION_EMAIL,
      subject: `Test Email - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h3>Test Email dari /api/test-email</h3>
          <p>Nama Anak: ${namaAnak}</p>
          <p>Nama Orang Tua: ${namaOrangTua}</p>
          <p>Nomor HP: ${nomorHp}</p>
          <p>Catatan: ${catatan}</p>
        </div>
      `,
    })

    return res.json({ success: true, message: 'Test email terkirim via SMTP (lokal jika diizinkan).' })
  } catch (error) {
    console.error('Test SMTP failed:', error)

    // coba Resend jika tersedia
    if (process.env.RESEND_API_KEY) {
      try {
        const payload = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: [process.env.REGISTRATION_EMAIL],
          subject: `Test Email - ${new Date().toISOString()}`,
          html: `<p>Test email via Resend</p><p>${catatan}</p>`,
        }

        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!r.ok) {
          const t = await r.text()
          console.error('Resend test error:', r.status, t)
        } else {
          return res.json({ success: true, message: 'Test email terkirim via Resend.' })
        }
      } catch (err) {
        console.error('Resend test failed:', err)
      }
    }

    // coba SendGrid HTTP fallback jika diset
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sendgridPayload = {
          personalizations: [{ to: [{ email: process.env.REGISTRATION_EMAIL }] }],
          from: { email: process.env.EMAIL_FROM || process.env.EMAIL_USER },
          subject: `Test Email - ${new Date().toISOString()}`,
          content: [{ type: 'text/html', value: `<p>Test email via SendGrid</p><p>${catatan}</p>` }],
        }

        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendgridPayload),
        })

        if (!sgRes.ok) {
          const text = await sgRes.text()
          console.error('SendGrid test error:', sgRes.status, text)
        } else {
          return res.json({ success: true, message: 'Test email terkirim via SendGrid.' })
        }
      } catch (sgErr) {
        console.error('SendGrid test failed:', sgErr)
      }
    }

    return res.status(500).json({ message: 'Gagal mengirim test email. Lihat log untuk detail.' })
  }
})

// SPA fallback: jika bukan route API, kirimkan index.html
app.use((req, res, next) => {
  // lewati permintaan API
  if (req.path.startsWith('/api')) return next()
  // hanya tangani GET untuk SPA
  if (req.method !== 'GET') return next()

  res.sendFile(path.join(clientPath, 'index.html'), (err) => {
    if (err) next(err)
  })
})

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})
