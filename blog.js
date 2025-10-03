document.addEventListener('DOMContentLoaded', () => {
  
  const config = {
    blogId: '6254769183374606696',
    apiKey: 'AIzaSyBvWOW46b0zJ3zmUp4fSUyaw1VnNvxCF60', 
    placeholderImage: 'https://via.placeholder.com/150x210/0c1012/94a3b8?text=No+Image'
  };
  
  async function renderBlogListPage() {
    const container = document.getElementById('blog-list-container');
    if (!container) return; // Keluar jika bukan di halaman branda
    
    container.innerHTML = `<p id="blog-list-loading">Memuat postingan...</p>`;
    
    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${config.blogId}/posts?key=${config.apiKey}&fetchImages=true&maxResults=20`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      
      container.innerHTML = ''; 
      
      (data.items || []).forEach(post => {
        const imageUrl = (post.images && post.images.length > 0) ? post.images[0].url : config.placeholderImage;
        l
        const card = document.createElement('a');
        card.href = `post.html?id=${post.id}`; 
        card.className = 'novel-card';
        card.style.textDecoration = 'none';
        
        card.innerHTML = `
                    <div class="novel-card-cover">
                        <img src='${imageUrl}' alt='Cover Postingan' style="object-fit: cover;"/>
                    </div>
                    <div class="novel-card-info">
                        <h4 class="novel-card-title">${post.title}</h4>
                    </div>
                `;
        container.appendChild(card);
      });
      
    } catch (error) {
      console.error(error);
      container.innerHTML = `<p>Gagal memuat postingan.</p>`;
    }
  }
  
  async function renderSinglePostPage() {
    const titleHeader = document.getElementById('blog-post-title-header');
    const container = document.getElementById('blog-post-content-container');
    if (!container) return; 
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
      document.title = "Error - Revisi Pro";
      titleHeader.textContent = "Error";
      container.innerHTML = `<p>ID Postingan tidak ditemukan. Silakan kembali ke beranda.</p>`;
      return;
    }
    
    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${config.blogId}/posts/${postId}?key=${config.apiKey}`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const post = await response.json();
      document.title = `${post.title} - Revisi Pro`;
titleHeader.textContent = post.title;

const tempDiv = document.createElement('div');
tempDiv.innerHTML = post.content;

const firstTitle = tempDiv.querySelector('h1, h2');
if (firstTitle) {
  firstTitle.remove();
}

const cleanContent = tempDiv.innerHTML;

container.innerHTML = `
    <p style="color: var(--text-secondary); font-size: 0.8em; margin-top: -10px;">
        Diterbitkan pada ${new Date(post.published).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>
    <div class="post-body">${cleanContent}</div>  `;
    } catch (error) {
      console.error(error);
      document.title = "Error Memuat - Revisi Pro";
      titleHeader.textContent = "Gagal Memuat";
      container.innerHTML = `<p>Tidak dapat mengambil data postingan. Mungkin postingan telah dihapus atau ID salah.</p>`;
    }
  }
  
  if (document.getElementById('blog-list-container')) {
    renderBlogListPage();
  } else if (document.getElementById('blog-post-content-container')) {
    renderSinglePostPage();
  }
});