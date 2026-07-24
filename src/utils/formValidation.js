export function validateRegistrationForm(values) {
  const errors = {}

  if (!values.namaAnak?.trim()) {
    errors.namaAnak = 'Nama anak harus diisi.'
  }

  if (!values.usiaAnak) {
    errors.usiaAnak = 'Usia anak harus diisi.'
  } else {
    const usia = Number(values.usiaAnak)
    if (usia < 3 || usia > 6) {
      errors.usiaAnak = 'Usia anak harus antara 3 sampai 6 tahun.'
    }
  }

  if (!values.namaOrangTua?.trim()) {
    errors.namaOrangTua = 'Nama orang tua harus diisi.'
  }

  if (!values.nomorHp?.trim()) {
    errors.nomorHp = 'Nomor HP harus diisi.'
  }

  if (!values.email?.trim()) {
    errors.email = 'Email harus diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Alamat email tidak valid.'
  }

  return errors
}
