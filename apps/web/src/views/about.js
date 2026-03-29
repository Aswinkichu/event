export function renderAbout(container) {
  container.innerHTML = `
    <div class="about-hero animate-fade-in">
      <div class="glass-card about-card">
        <h2 class="section-title">Our Story</h2>
        <p class="about-text">
          Founded in 2010, <strong>Eventora</strong> has been at the forefront of creating magical moments. 
          We believe that every event is a unique story waiting to be told, and our mission is to tell it 
          with elegance, precision, and passion.
        </p>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Weddings</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">200+</span>
            <span class="stat-label">Corporate Events</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <span class="stat-label">Happy Clients</span>
          </div>
        </div>

        <h3 style="margin-top: 2rem;">Why Choose Us?</h3>
        <ul class="features-list">
          <li>✨ <strong>Bespoke Planning:</strong> Tailored specifically to your vision.</li>
          <li>🎯 <strong>Attention to Detail:</strong> We miss nothing, so you can enjoy everything.</li>
          <li>🤝 <strong>Expert Partners:</strong> Only the best vendors in the industry.</li>
        </ul>
      </div>
    </div>
  `;
}
