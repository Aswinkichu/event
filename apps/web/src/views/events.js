import { apiFetch } from '../api.js';

export async function renderEvents(container) {
  container.innerHTML = `
    <div class="events-view animate-fade-in">
      <div class="view-header">
        <h2 class="section-title">Our Event Services</h2>
        <p class="section-subtitle">From intimate gatherings to grand celebrations, we handle it all.</p>
      </div>
      <div id="events-grid" class="grid-list">
        <p>Loading our signature events...</p>
      </div>
    </div>
  `;

  try {
    const data = await apiFetch('/customer/categories');
    const categories = data.data || data.categories || data;
    
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card glass event-service-card';
      card.innerHTML = `
        <div class="event-image-container">
          ${cat.imageUrl ? `<img src="${cat.imageUrl}" alt="${cat.name}" class="event-hero-img">` : '<div class="img-placeholder">Image coming soon</div>'}
          <div class="event-overlay">
            <span class="event-tag">Premium</span>
          </div>
        </div>
        <div class="card-content">
          <h3>${cat.name}</h3>
          <p>${cat.description || 'Custom tailored event experience.'}</p>
          <button class="btn secondary small" onclick="window.location.hash = '#auth'">Book Now</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    document.getElementById('events-grid').innerHTML = `<p class="error-msg">Failed to load events: ${err.message}</p>`;
  }
}
