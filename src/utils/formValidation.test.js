import { describe, expect, it } from 'vitest'
import { validateRegistrationForm } from './formValidation'

describe('validateRegistrationForm', () => {
  it('returns errors for incomplete or invalid values', () => {
    const errors = validateRegistrationForm({
      namaAnak: ' ',
      usiaAnak: '2',
      namaOrangTua: ' ',
      nomorHp: ' ',
      email: 'invalid-email',
      catatan: '',
    })

    expect(errors).toEqual({
      namaAnak: 'Nama anak harus diisi.',
      usiaAnak: 'Usia anak harus antara 3 sampai 6 tahun.',
      namaOrangTua: 'Nama orang tua harus diisi.',
      nomorHp: 'Nomor HP harus diisi.',
      email: 'Alamat email tidak valid.',
    })
  })

  it('returns no errors for a valid submission', () => {
    const errors = validateRegistrationForm({
      namaAnak: 'Alya',
      usiaAnak: '5',
      namaOrangTua: 'Dewi',
      nomorHp: '081234567890',
      email: 'dewi@example.com',
      catatan: 'Suka musik',
    })

    expect(errors).toEqual({})
  })
})
