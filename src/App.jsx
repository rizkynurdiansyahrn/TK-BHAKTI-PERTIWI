import { useEffect, useState } from 'react'
import './App.css'
import { validateRegistrationForm } from './utils/formValidation'

const img = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const heroImage = img('1509062522246-3755977927d7')

const navItems = [
  { id: 'home', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'programs', label: 'Program' },
  { id: 'fasilitas', label: 'Fasilitas' },
  { id: 'testimoni', label: 'Testimoni' },
]

const programs = [
  {
    id: 'akademik',
    title: 'Program Akademik',
    description:
      'Pembelajaran berbasis kompetensi dengan kurikulum yang relevan dan guru pendamping yang siap membantu setiap siswa berkembang.',
    features: ['Kurikulum Merdeka', 'Laboratorium modern', 'Bimbingan belajar personal'],
    image: img('1544717297-fa95b6ee9643'),
  },
  {
    id: 'ekstrakurikuler',
    title: 'Ekstrakurikuler',
    description:
      'Ruang bagi siswa untuk mengekspresikan bakat melalui organisasi, olahraga, seni, dan kegiatan sosial yang terarah.',
    features: ['Pramuka dan Paskibra', 'Tim olahraga', 'Karya seni dan teater'],
    image: img('1577896851231-70ef18881754'),
  },
  {
    id: 'prestasi',
    title: 'Prestasi & Karier',
    description:
      'Dukungan penuh untuk meraih prestasi akademik maupun non-akademik dan mempersiapkan masa depan lewat magang.',
    features: ['Lomba tingkat daerah', 'Kunjungan industri', 'Mentoring karier'],
    image: img('1571260899304-425eee4c7efc'),
  },
]

const highlights = [
  {
    title: 'Fasilitas Lengkap',
    text: 'Ruang kelas nyaman, perpustakaan digital, dan lapangan olahraga yang mendukung belajar aktif.',
    image: img('1498243691581-b145c3f54a5a'),
  },
  {
    title: 'Lingkungan Aman',
    text: 'Sistem keamanan 24 jam dan suasana sekolah yang penuh kedisiplinan, semangat, dan rasa hormat.',
    image: img('1529390079861-591de354faf5'),
  },
  {
    title: 'Kegiatan Inspiratif',
    text: 'Festival ilmiah, seminar alumni, dan kegiatan sosial rutin menumbuhkan jiwa kepemimpinan.',
    image: img('1497486751825-1233686d5d80'),
  },
]

const testimonials = [
  {
    name: 'Nadia, Orang Tua Siswa',
    quote: 'Sekolah ini memberi perhatian penuh pada perkembangan anak, baik akademik maupun karakter.',
    avatar: img('1438761681033-6461ffad8d80', 200),
  },
  {
    name: 'Rian, Siswa Kelas XII',
    quote: 'Saya merasa belajar di sini lebih bermakna karena ada banyak kesempatan mengembangkan bakat.',
    avatar: img('1500648767791-00dcc994a43e', 200),
  },
]

function App() {
  const [activeProgram, setActiveProgram] = useState(programs[0].id)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [formValues, setFormValues] = useState({
    namaAnak: '',
    usiaAnak: '',
    namaOrangTua: '',
    nomorHp: '',
    email: '',
    catatan: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeProgramData = programs.find((item) => item.id === activeProgram) ?? programs[0]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let ticking = false

    const update = () => {
      const offset = 150
      let current = navItems[0].id
      for (const item of navItems) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= offset) {
          current = item.id
        }
      }
      setActiveSection(current)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validateRegistrationForm(formValues)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim pendaftaran.')
      }

      setSuccessMessage(data.message)
      setFormValues({ namaAnak: '', usiaAnak: '', namaOrangTua: '', nomorHp: '', email: '', catatan: '' })
    } catch (error) {
      setSuccessMessage(error.message || 'Terjadi kesalahan saat mengirim pendaftaran.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSuccessMessage(''), 8000)
    }
  }

  return (
    <div className="page-shell">
      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        <a className="brand" href="#home">
          <span className="brand-mark">TK</span>
          <span>TK Bhakti Pertiwi Cimalaka</span>
        </a>

        <nav className="nav-links" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? 'nav-active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary" href="#daftar">
          Daftar Sekarang
        </a>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-copy fade-up">
            <p className="eyebrow">TK Bhakti Pertiwi Cimalaka</p>
            <h1>Membangun kecerdasan dan karakter anak sejak usia dini.</h1>
            <p className="hero-text">
              Pendidikan anak usia dini dengan suasana ceria, aman, dan penuh sentuhan kreatif untuk mendukung tumbuh kembang buah hati Anda.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#programs">
                Lihat Program
              </a>
              <a className="btn btn-secondary" href="#about">
                Kenali Kami
              </a>
            </div>

            <div className="stats-grid">
              <div>
                <strong>1.200+</strong>
                <span>Siswa</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Kelulusan</span>
              </div>
              <div>
                <strong>30+</strong>
                <span>Ekstrakurikuler</span>
              </div>
            </div>
          </div>

          <figure className="hero-visual fade-up">
            <div className="hero-img-wrap">
              <img
                src={heroImage}
                alt="Suasana belajar yang ceria dan hangat di TK Bhakti Pertiwi Cimalaka"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <figcaption className="hero-img-caption">
              <span className="hero-card-badge">2026</span>
              <strong>Belajar dengan semangat, tumbuh dengan percaya diri.</strong>
              <p>
                Dari kelas, laboratorium, hingga kegiatan sosial, setiap momen dirancang untuk mengembangkan potensi terbaik siswa.
              </p>
            </figcaption>
          </figure>
        </section>

        <section id="about" className="section fade-up">
          <div className="section-heading">
            <p className="eyebrow">Tentang sekolah kami</p>
            <h2>Menghadirkan pendidikan yang seimbang antara ilmu, bakat, dan karakter.</h2>
          </div>

          <div className="about-grid">
            <article className="info-card fade-up">
              <h3>Visi</h3>
              <p>Menjadi sekolah unggulan yang mencetak lulusan cerdas, inovatif, dan siap berkontribusi.</p>
            </article>
            <article className="info-card fade-up">
              <h3>Misi</h3>
              <p>Mengembangkan pembelajaran berkualitas, budaya literasi, serta jiwa kepemimpinan sejak dini.</p>
            </article>
            <article className="info-card fade-up">
              <h3>Nilai Kami</h3>
              <p>Disiplin, integritas, kolaborasi, dan semangat terus belajar menjadi fondasi utama kami.</p>
            </article>
          </div>
        </section>

        <section id="programs" className="section fade-up">
          <div className="section-heading">
            <p className="eyebrow">Program unggulan</p>
            <h2>Pilih fokus yang paling sesuai dengan minat dan cita-cita siswa.</h2>
          </div>

          <div className="tabs fade-up" role="tablist" aria-label="Program sekolah">
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                className={`tab ${activeProgram === program.id ? 'active' : ''}`}
                onClick={() => setActiveProgram(program.id)}
              >
                {program.title}
              </button>
            ))}
          </div>

          <div className="program-panel fade-up">
            <div className="program-media">
              <img src={activeProgramData.image} alt={activeProgramData.title} loading="lazy" />
            </div>
            <div className="program-body">
              <h3>{activeProgramData.title}</h3>
              <p>{activeProgramData.description}</p>
              <ul>
                {activeProgramData.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="mini-card">
                <h4>Kenapa siswa suka?</h4>
                <p>Belajar terasa menyenangkan karena ada ruang untuk eksplorasi, kolaborasi, dan tumbuh bersama.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="fasilitas" className="section fade-up">
          <div className="section-heading">
            <p className="eyebrow">Fasilitas pendukung</p>
            <h2>Semua kebutuhan belajar dan pengembangan siswa tersedia di sini.</h2>
          </div>

          <div className="card-grid">
            {highlights.map((item) => (
              <article className="info-card media-card fade-up" key={item.title}>
                <div className="card-media">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="testimoni" className="section fade-up">
          <div className="section-heading">
            <p className="eyebrow">Testimoni</p>
            <h2>Apa yang orang tua dan siswa rasakan saat belajar di sini?</h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <blockquote className="testimonial-card fade-up" key={item.name}>
                <p>“{item.quote}”</p>
                <footer className="testimonial-foot">
                  <img className="avatar" src={item.avatar} alt="" aria-hidden="true" loading="lazy" />
                  <span>{item.name}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="daftar" className="section register-section fade-up">
          <div className="section-heading">
            <p className="eyebrow">Pendaftaran</p>
            <h2>Isi data pendaftaran untuk bergabung ke TK Bhakti Pertiwi Cimalaka.</h2>
          </div>

          <div className="register-grid">
            <div className="info-card">
              <h3>Lengkap dan Mudah</h3>
              <p>Isi formulir di samping untuk mendapatkan informasi selanjutnya tentang jadwal tes dan orientasi siswa baru.</p>
              <ul>
                <li>Data anak dan orang tua</li>
                <li>Usia 3-6 tahun</li>
                <li>Jalur reguler & program sekolah dini</li>
              </ul>
            </div>

            <form className="register-form" onSubmit={handleSubmit}>
              <label>
                Nama Anak
                <input
                  type="text"
                  name="namaAnak"
                  value={formValues.namaAnak}
                  onChange={handleChange}
                  placeholder="Nama lengkap anak"
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(formErrors.namaAnak)}
                />
                {formErrors.namaAnak && <span className="field-error">{formErrors.namaAnak}</span>}
              </label>
              <label>
                Usia Anak
                <input
                  type="number"
                  name="usiaAnak"
                  value={formValues.usiaAnak}
                  onChange={handleChange}
                  placeholder="Usia anak"
                  min="3"
                  max="6"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(formErrors.usiaAnak)}
                />
                {formErrors.usiaAnak && <span className="field-error">{formErrors.usiaAnak}</span>}
              </label>
              <label>
                Nama Orang Tua
                <input
                  type="text"
                  name="namaOrangTua"
                  value={formValues.namaOrangTua}
                  onChange={handleChange}
                  placeholder="Nama orang tua/wali"
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(formErrors.namaOrangTua)}
                />
                {formErrors.namaOrangTua && <span className="field-error">{formErrors.namaOrangTua}</span>}
              </label>
              <label>
                Nomor HP
                <input
                  type="tel"
                  name="nomorHp"
                  value={formValues.nomorHp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(formErrors.nomorHp)}
                />
                {formErrors.nomorHp && <span className="field-error">{formErrors.nomorHp}</span>}
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  inputMode="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(formErrors.email)}
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </label>
              <label>
                Catatan Singkat
                <textarea
                  name="catatan"
                  value={formValues.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: minat, kebutuhan, atau jadwal kunjungan"
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
              </button>
              {successMessage && (
                <p className="success-message" aria-live="polite">
                  {successMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href="#home">
                <span className="brand-mark">TK</span>
                <span>TK Bhakti Pertiwi Cimalaka</span>
              </a>
              <p>
                Pendidikan anak usia dini dengan suasana ceria, aman, dan penuh dukungan untuk tumbuh kembang buah hati Anda.
              </p>
            </div>

            <nav className="footer-col" aria-label="Navigasi footer">
              <h4>Navigasi</h4>
              <ul>
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="footer-col">
              <h4>Kontak</h4>
              <ul>
                <li>Cimalaka, Sumedang, Jawa Barat</li>
                <li>
                  <a href="#daftar">Formulir pendaftaran online</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} TK Bhakti Pertiwi Cimalaka. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
