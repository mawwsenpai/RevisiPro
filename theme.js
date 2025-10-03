(function() {
  // Fungsi ini akan langsung berjalan saat file dipanggil
  
  // 1. Ambil tema & font yang tersimpan dari aplikasi utama
  const savedTheme = localStorage.getItem('userTheme') || 'dark'; // Default ke 'dark' jika tidak ada
  const savedFont = localStorage.getItem('userFont') || 'poppins';
  
  // 2. Terapkan atribut ke tag <body>
  document.body.dataset.theme = savedTheme;
  document.body.dataset.font = savedFont;
  
  // 3. Fungsi untuk memuat Google Font (diambil dari logika script.js utama)
  function loadGoogleFont(fontFamily) {
    const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
    if (document.getElementById(fontId)) {
      return;
    }
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;700&display=swap`;
    document.head.appendChild(link);
  }
  
  // 4. Daftar font yang mungkin ada (sesuaikan jika perlu)
  const fontList = ['Poppins', 'JetBrains Mono', 'Sora', 'Roboto', 'Merriweather', 'Lato']; // Tambahkan font lain jika ada
  const fontName = fontList.find(f => f.toLowerCase().replace(/\s/g, '-') === savedFont) || 'Poppins';
  loadGoogleFont(fontName);
  
  // 5. Atur font utama di CSS Variable
  document.documentElement.style.setProperty('--font-main', `'${fontName}', sans-serif`);
  
})();