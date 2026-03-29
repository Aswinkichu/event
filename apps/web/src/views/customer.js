import { apiFetch } from '../api.js';
import { showPaymentGateway } from '../payment.js';

export async function renderCustomer(container) {
  container.innerHTML = `
    <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2>Customer Dashboard</h2>
        <p class="text-muted">Book and manage your events easily.</p>
      </div>
      <div class="nav-notification" id="notification-bell">
        <span class="bell-icon">🔔</span>
        <span class="notification-badge" id="notification-count" style="display: none;">0</span>
        <div class="notification-dropdown" id="notification-dropdown">
          <div class="notification-header">
            <h3>Notifications</h3>
            <button class="btn secondary small" id="close-notifications" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Close</button>
          </div>
          <div id="notification-list">
            <p class="no-notifications">Loading notifications...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-tabs">
      <button class="btn primary small tab-btn" id="tab-new-booking">New Booking</button>
      <button class="btn secondary small tab-btn" id="tab-my-bookings">My Bookings</button>
    </div>

    <div id="customer-content" style="margin-top: 2rem;"></div>
  `;

  document.getElementById('tab-new-booking').addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('primary'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('secondary'));
    document.getElementById('tab-new-booking').classList.remove('secondary');
    document.getElementById('tab-new-booking').classList.add('primary');
    loadCategories();
  });
  
  document.getElementById('tab-my-bookings').addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('primary'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('secondary'));
    document.getElementById('tab-my-bookings').classList.remove('secondary');
    document.getElementById('tab-my-bookings').classList.add('primary');
    loadMyBookings();
  });

  // Load Categories by default
  loadCategories();
  loadNotifications();

  // Notification UI Logic
  const bell = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  const closeBtn = document.getElementById('close-notifications');

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
      loadNotifications();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.remove('active');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('active');
  });

  async function loadNotifications() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-count');
    try {
      const data = await apiFetch('/notifications');
      const notifications = data.data || [];
      
      const unreadCount = notifications.filter(n => !n.isRead).length;
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }

      if (notifications.length === 0) {
        list.innerHTML = '<p class="no-notifications">No notifications yet.</p>';
        return;
      }

      list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="window.markAsRead('${n.id}')">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
          <span class="time">${new Date(n.createdAt).toLocaleString()}</span>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = `<p class="error-msg">${err.message}</p>`;
    }
  }

  window.markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      loadNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  async function loadCategories() {
    const content = document.getElementById('customer-content');
    content.innerHTML = '<p>Loading categories...</p>';
    try {
      const data = await apiFetch('/customer/categories');
      const categories = data.data || data.categories || data;
      
      let html = '<div class="grid-list">';
      categories.forEach(cat => {
        html += `
          <div class="card glass cursor-pointer" onclick="window.selectCategory('${cat.id}', '${cat.name}')">
            ${cat.imageUrl ? `<img src="${cat.imageUrl}" alt="${cat.name}" class="card-image">` : ''}
            <div class="card-content">
              <h3>${cat.name}</h3>
              <p>${cat.description || ''}</p>
            </div>
          </div>
        `;
      });
      html += '</div>';
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  }

  window.selectCategory = async (categoryId, categoryName) => {
    const content = document.getElementById('customer-content');
    content.innerHTML = '<p>Loading options...</p>';
    try {
      const data = await apiFetch(`/customer/categories/${categoryId}/options`);
      const options = data.data || data.options || data;
      
      // Group options by their type for better visual organization
      const groupedOptions = options.reduce((acc, opt) => {
        const type = opt.type || 'OTHER';
        acc[type] = acc[type] || [];
        acc[type].push(opt);
        return acc;
      }, {});

      let html = `
        <div class="card glass" style="max-width: 900px; margin: 0 auto; padding: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 2rem; color: var(--accent); border-bottom: 2px solid var(--border); padding-bottom: 1rem;">Booking: ${categoryName}</h2>
          <form id="booking-form">
            <input type="hidden" id="booking-category" value="${categoryId}">
            
            <div class="input-group" style="margin-bottom: 3rem;">
              <label style="font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1rem;">When is your event?</label>
               <input type="text" id="booking-date" placeholder="Select Date and Time" required style="font-size: 1.1rem; padding: 1rem;">
            </div>
            
            <div class="input-group" style="margin-bottom: 3rem;">
              <label style="font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1rem;">Number of People</label>
               <input type="number" id="number-of-people" placeholder="e.g., 50" min="1" style="font-size: 1.1rem; padding: 1rem;">
            </div>
            
            <h3 style="margin-bottom: 2rem; font-size: 1.5rem;">Select Your Package & Options</h3>
            <div class="options-container" style="margin-bottom: 3rem;">
      `;
      
      for (const [type, opts] of Object.entries(groupedOptions)) {
        const mainOpts = opts.filter(o => !o.parentId);
        const subOpts = opts.filter(o => o.parentId);

        html += `
          <div class="type-section" id="section-${type}">
            <h4>${type.replace(/_/g, ' ')}</h4>
            <div class="options-grid" id="grid-${type}">
        `;
        mainOpts.forEach(opt => {
          const itemSubs = subOpts.filter(s => s.parentId === opt.id);
          html += `
            <div class="option-group" style="display: flex; flex-direction: column; gap: 1rem;">
              <label class="option-label">
                <input type="checkbox" name="booking-options" value="${opt.id}" data-price="${opt.price}">
                <div class="option-card">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="${opt.name}" class="option-image">` : ''}
                  <div class="option-card-content">
                    <div>
                      <div class="option-card-header">
                        <span class="option-title">${opt.name}</span>
                      </div>
                      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.4;">${opt.description || 'Premium selection for your event.'}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                      <span class="option-type">${opt.type}</span>
                      <span class="option-price">₹${opt.price}</span>
                    </div>
                  </div>
                </div>
              </label>
              ${itemSubs.length > 0 ? `
                <div class="sub-options-container" style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                  <p style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="display:inline-block; width: 6px; height: 6px; background: var(--accent); border-radius: 50%;"></span>
                    Customize your selection:
                  </p>
                  <div class="sub-options-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem;">
                    ${itemSubs.map(s => `
                      <label class="sub-option-card-label" style="cursor: pointer; position: relative;">
                        <input type="checkbox" name="booking-options" value="${s.id}" data-price="${s.price}" style="position: absolute; opacity: 0;">
                        <div class="sub-option-card" style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: #fff; transition: all 0.2s ease;">
                          ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.name}" style="width: 100%; height: 100px; object-fit: cover; border-bottom: 1px solid #eee;">` : '<div style="width: 100%; height: 100px; background: #f8f8f8; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 0.7rem;">No Image</div>'}
                          <div style="padding: 0.75rem;">
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
                            <div style="font-size: 0.8rem; color: var(--accent); font-weight: 700;">+₹${s.price}</div>
                          </div>
                          <div class="selection-indicator" style="position: absolute; top: 0.5rem; right: 0.5rem; width: 20px; height: 20px; background: #fff; border: 2px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                             <span style="color: #fff; font-size: 0.7rem; font-weight: bold; display: none;">✓</span>
                          </div>
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        });
        html += `
            </div>
            
            <div class="custom-request-box" style="margin-top: 2rem; padding: 2rem; border-radius: 16px; background: linear-gradient(135deg, #fdfdfd 0%, #f7f7f7 100%); border: 1px solid var(--border); position: relative; overflow: hidden;">
              <div style="position: absolute; top: -20px; right: -20px; font-size: 5rem; color: rgba(0,0,0,0.03); transform: rotate(-15deg); pointer-events: none;">✨</div>
              <div style="position: relative; z-index: 1;">
                <h4 style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                   <span style="font-size: 1.2rem;">💡</span> Custom Request
                </h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">Have a specific item in mind? Add it here and we'll handle the rest.</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                  <div style="flex: 2; min-width: 200px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Item Name</label>
                    <input type="text" id="custom-name-${type}" placeholder="e.g. Vintage Champagne Buckets" style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #ddd; font-size: 0.9rem;">
                  </div>
                  <div style="flex: 1; min-width: 100px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Est. Price ($)</label>
                    <input type="number" id="custom-price-${type}" placeholder="0.00" style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #ddd; font-size: 0.9rem;">
                  </div>
                  <div style="flex: 1.5; min-width: 150px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Reference Image</label>
                    <input type="file" id="custom-image-${type}" accept="image/*" style="width: 100%; font-size: 0.8rem;">
                  </div>
                  <div style="display: flex; align-items: flex-end;">
                    <button type="button" class="btn primary" style="padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600;" onclick="window.addCustomItem('${categoryId}', '${type}')">Add Item</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      window.addCustomItem = async (catId, type) => {
        const nameInput = document.getElementById(`custom-name-${type}`);
        const priceInput = document.getElementById(`custom-price-${type}`);
        const fileInput = document.getElementById(`custom-image-${type}`);
        
        const name = nameInput.value;
        const price = parseFloat(priceInput.value || 0);
        const file = fileInput.files[0];
        
        if (!name) { showToast('Please enter an item name', 'warning'); return; }

        try {
          const formData = new FormData();
          formData.append('categoryId', catId);
          formData.append('type', type);
          formData.append('name', name);
          formData.append('price', price);
          if (file) {
            formData.append('image', file);
          }

          const opt = await apiFetch('/customer/options', {
            method: 'POST',
            body: formData
          });
          
          const grid = document.getElementById(`grid-${type}`);
          const newHtml = `
            <div class="option-group" style="display: flex; flex-direction: column; gap: 1rem;">
              <label class="option-label">
                <input type="checkbox" name="booking-options" value="${opt.id}" data-price="${opt.price}" checked>
                <div class="option-card" style="border-color: var(--accent); border-style: dashed; background: #fffcfd;">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="${opt.name}" class="option-image">` : ''}
                  <div class="option-card-content">
                    <div>
                      <div class="option-card-header">
                        <span class="option-title">${opt.name}</span>
                        <span style="font-size: 0.7rem; background: var(--accent); color: #fff; padding: 0.1rem 0.5rem; border-radius: 10px; font-weight: 700;">CUSTOM</span>
                      </div>
                      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.4;">Custom request added to your booking.</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                      <span class="option-type">${opt.type}</span>
                      <span class="option-price">₹${opt.price}</span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          `;
          grid.insertAdjacentHTML('beforeend', newHtml);
          nameInput.value = ''; priceInput.value = ''; fileInput.value = '';
          window.updateTotalPrice();
          const newCb = grid.querySelector(`input[value="${opt.id}"]`);
          newCb.addEventListener('change', window.updateTotalPrice);
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
      };


      window.updateTotalPrice = () => {
        let total = 0;
        document.querySelectorAll('input[name="booking-options"]:checked').forEach(checkedBox => {
          total += parseFloat(checkedBox.dataset.price || 0);
          
          // Selection UI Feedback
          const parentLabel = checkedBox.closest('label');
          if (parentLabel && parentLabel.classList.contains('sub-option-card-label')) {
            const card = parentLabel.querySelector('.sub-option-card');
            const indicator = parentLabel.querySelector('.selection-indicator');
            const check = indicator.querySelector('span');
            
            if (checkedBox.checked) {
              card.style.borderColor = 'var(--accent)';
              card.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
              indicator.style.background = 'var(--accent)';
              indicator.style.borderColor = 'var(--accent)';
              check.style.display = 'block';
            } else {
              card.style.borderColor = 'var(--border)';
              card.style.boxShadow = 'none';
              indicator.style.background = '#fff';
              indicator.style.borderColor = 'var(--border)';
              check.style.display = 'none';
            }
          }
        });
        document.getElementById('total-price').innerText = `₹${total}`;
      };

      html += `
            <div style="padding-top: 2rem; border-top: 2px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fffcfd; margin: 1.5rem -3rem -3rem; padding: 2rem 3rem; border-radius: 0 0 16px 16px;">
              <div>
                <span style="font-size: 1.1rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Total Estimated Cost</span>
                <span id="total-price" style="font-size: 2rem; font-weight: 800; color: var(--text-main);">₹0</span>
              </div>
              <button class="btn primary" type="submit" style="font-size: 1.1rem; padding: 1rem 3rem;">Confirm Booking</button>
            </div>
            <div id="booking-error" class="error-msg" style="margin-top: 1rem;"></div>
          </form>
        </div>
      `;

      content.innerHTML = html;
      
      // Initialize Flatpickr
      if (typeof flatpickr !== 'undefined') {
        flatpickr("#booking-date", {
          enableTime: true,
          dateFormat: "Y-m-d H:i",
          minDate: "today",
          time_24hr: true,
          disableMobile: "true"
        });
      }
      
      // Initialize price display listeners
      document.querySelectorAll('input[name="booking-options"]').forEach(cb => {
        cb.addEventListener('change', window.updateTotalPrice);
      });

      
      document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('booking-date').value;
        const numberOfPeople = parseInt(document.getElementById('number-of-people').value) || undefined;
        const selectedOptions = Array.from(document.querySelectorAll('input[name="booking-options"]:checked')).map(cb => cb.value);
        
        if (selectedOptions.length === 0) {
          document.getElementById('booking-error').innerHTML = 'Please select at least one option';
          return;
        }
        
        const totalPrice = Array.from(document.querySelectorAll('input[name="booking-options"]:checked'))
          .reduce((sum, cb) => sum + parseFloat(cb.dataset.price || 0), 0);
        
        // Show payment gateway
        showPaymentGateway(
          totalPrice,
          async (paymentData) => {
            // Payment successful - create booking
            try {
              await apiFetch('/customer/bookings', {
                method: 'POST',
                body: JSON.stringify({
                  categoryId,
                  selectedOptions,
                  eventDate: new Date(date).toISOString(),
                  numberOfPeople,
                  paymentId: paymentData.transactionId
                })
              });
              showToast('Booking successful! 🎉', 'success');
              document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('primary'));
              document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('secondary'));
              document.getElementById('tab-my-bookings').classList.remove('secondary');
              document.getElementById('tab-my-bookings').classList.add('primary');
              loadMyBookings();
            } catch (err) {
              document.getElementById('booking-error').innerHTML = err.message.replace(/\n/g, '<br>');
            }
          },
          (error) => {
            // Payment failed or cancelled
            showToast(error || 'Payment cancelled', 'error');
          }
        );
      });
      
    } catch (err) {
      content.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  };

  async function loadMyBookings() {
    const content = document.getElementById('customer-content');
    content.innerHTML = '<p>Loading bookings...</p>';
    try {
      const data = await apiFetch('/customer/bookings');
      const bookings = data.data || data.bookings || data;
      
      if (bookings.length === 0) {
        content.innerHTML = '<p>No bookings found.</p>';
        return;
      }

      let html = '<div class="table-container"><table style="width: 100%; text-align: left;"><thead><tr><th>ID</th><th>Category</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      bookings.forEach(b => {
        html += `
          <tr>
            <td>${b.id.substring(0, 8)}...</td>
            <td>${b.category?.name || 'Unknown'}</td>
            <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
            <td>${new Date(b.eventDate).toLocaleDateString()}</td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  }
}
