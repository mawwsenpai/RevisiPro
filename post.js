document.addEventListener('DOMContentLoaded', () => {

    const BLOG_ID = '6254769183374606696';
    const API_KEY = 'AIzaSyBvWOW46b0zJ3zmUp4fSUyaw1VnNvxCF60'; 
    const judulContainer = document.getElementById('judul-postingan');
    const isiContainer = document.getElementById('isi-postingan');

    async function muatPostinganBlogger() {
        try {
            const params = new URLSearchParams(window.location.search);
            const postPath = params.get('path');

            if (!postPath) {
                throw new Error("Path postingan tidak ditemukan di URL. Link di halaman utama mungkin salah.");
            }

            const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/bypath?path=${postPath}&key=${API_KEY}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                throw new Error(`Error dari Blogger: ${data.error.message}`);
            }

            document.title = data.title; // Ganti judul tab browser
            judulContainer.textContent = data.title;
            isiContainer.innerHTML = data.content; 

        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            judulContainer.textContent = "Gagal Memuat Postingan";
            isiContainer.innerHTML = `<p style="color: red;">Waduh, ada masalah: ${error.message}</p><p>Coba cek lagi BLOG_ID dan API_KEY di file post.js, atau pastikan link postingannya sudah benar.</p>`;
        }
    }

    // Jalankan fungsi utama
    muatPostinganBlogger();
});
