import { apiFetch } from '../api.js';

export function renderContact(container) {
  container.innerHTML = `
    <div class="contact-view animate-fade-in">
      <div class="contact-container glass">
        <div class="contact-info">
          <h2 class="section-title">Get in Touch</h2>
          <p>Have a question or ready to start planning? We're here to help.</p>
          
          <div class="contact-details">
            <div class="detail-item">
              <span class="icon">📍</span>
              <div>
                <strong>Visit Us</strong>
                <p>123 Elegance Row, Bloom Street<br>Creative District, NY 10001</p>
              </div>
            </div>
            <div class="detail-item">
              <span class="icon">📞</span>
              <div>
                <strong>Call Us</strong>
                <p>+1 (555) EVENT-ORA</p>
              </div>
            </div>
            <div class="detail-item">
              <span class="icon">✉️</span>
              <div>
                <strong>Email Us</strong>
                <p>hello@eventora.com</p>
              </div>
            </div>
          </div>
        </div>

        <form class="contact-form" id="contact-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="contact-name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="contact-email" required placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Subject</label>
            <select id="contact-subject">
              <option>Wedding Planning</option>
              <option>Corporate Event</option>
              <option>Private Party</option>
              <option>General Inquiry</option>
            </select>
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea id="contact-message" rows="4" required placeholder="Tell us about your event..."></textarea>
          </div>
          <button type="submit" class="btn primary full-width" id="contact-submit">Send Message</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('contact-form').onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('contact-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    try {
      const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
      };

      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      e.target.reset();
    } catch (err) {
      showToast('Failed to send message: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send Message';
    }
  };
}
