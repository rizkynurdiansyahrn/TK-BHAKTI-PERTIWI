import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30000,
  })

  try {
    console.log('Verifying SMTP connection...')
    await transporter.verify()
    console.log('SMTP connected: OK')
    process.exit(0)
  } catch (err) {
    console.error('SMTP verify failed:')
    console.error(err)
    process.exit(1)
  }
}

main()
