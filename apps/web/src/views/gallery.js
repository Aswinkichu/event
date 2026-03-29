export function renderGallery(container) {
  const images = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
    'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=500',
    'https://images.unsplash.com/photo-1470753937643-efad93c23abc?w=500'
  ];

  container.innerHTML = `
    <div class="gallery-view animate-fade-in">
      <div class="view-header">
        <h2 class="section-title">Visual Inspiration</h2>
        <p class="section-subtitle">A glimpse into the extraordinary moments we've captured.</p>
      </div>
      <div class="gallery-grid">
        ${images.map(img => `
          <div class="gallery-item glass">
            <img src="${img}" alt="Gallery image" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
