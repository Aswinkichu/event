import { apiFetch } from '../api.js';

export async function renderAdmin(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <h2>Admin Hub</h2>
      <p class="text-muted">Manage all bookings, categories, and options across the agency.</p>
    </div>

    <div class="dashboard-tabs">
      <button class="btn primary small tab-btn" id="tab-all-bookings">All Bookings</button>
      <button class="btn secondary small tab-btn" id="tab-manage-cats">Manage Categories</button>
    </div>

    <div id="admin-content" style="margin-top: 2rem;"></div>
  `;

  const tabBookings = document.getElementById('tab-all-bookings');
  const tabCats = document.getElementById('tab-manage-cats');

  function updateTabs(activeTab) {
    if (activeTab === 'bookings') {
      tabBookings.classList.replace('secondary', 'primary');
      tabCats.classList.replace('primary', 'secondary');
    } else {
      tabBookings.classList.replace('primary', 'secondary');
      tabCats.classList.replace('secondary', 'primary');
    }
  }

  tabBookings.addEventListener('click', () => {
    updateTabs('bookings');
    loadAllBookings();
  });
  tabCats.addEventListener('click', () => {
    updateTabs('cats');
    loadCategories();
  });

  // Load bookings by default
  loadAllBookings();

  async function loadAllBookings(page = 1) {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<p>Loading all bookings...</p>';
    try {
      const data = await apiFetch(`/admin/bookings?page=${page}&limit=10&sortBy=createdAt&order=desc`);
      const bookings = data.data || [];
      const { total, totalPages } = data;
      
      if (bookings.length === 0) {
        content.innerHTML = '<p>No bookings found.</p>';
        return;
      }

      let html = '<div class="table-container"><table style="width: 100%; text-align: left;"><thead><tr><th>ID</th><th>User</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>';
      bookings.forEach(b => {
        html += `
          <tr>
            <td>${b.id.substring(0, 8)}...</td>
            <td>${b.user?.email || 'Unknown'}</td>
            <td>${b.category?.name || 'Unknown'}</td>
            <td><span class="badge ${b.status.toLowerCase()}" id="badge-${b.id}">${b.status}</span></td>
            <td>${new Date(b.eventDate).toLocaleDateString()}</td>
            <td>
              <div style="display:flex; gap:0.25rem;">
                <button class="btn secondary small" onclick="window.viewBookingDetails('${b.id}')" style="padding: 0.25rem; font-size: 0.75rem;">View</button>
                <select class="status-select" onchange="window.updateStatus('${b.id}', this.value)" style="padding: 0.25rem; font-size: 0.75rem;">
                  <option value="" disabled selected>Status...</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </td>
          </tr>

        `;
      });
      html += '</tbody></table></div>';
      
      // Pagination
      if (totalPages > 1) {
        html += '<div class="pagination" style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem;">';
        
        if (page > 1) {
          html += `<button class="btn secondary small" onclick="window.loadAllBookingsPage(${page - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
          if (i === page) {
            html += `<button class="btn primary small" disabled>${i}</button>`;
          } else if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            html += `<button class="btn secondary small" onclick="window.loadAllBookingsPage(${i})">${i}</button>`;
          } else if (i === page - 2 || i === page + 2) {
            html += '<span style="padding: 0.5rem;">...</span>';
          }
        }
        
        if (page < totalPages) {
          html += `<button class="btn secondary small" onclick="window.loadAllBookingsPage(${page + 1})">Next</button>`;
        }
        
        html += '</div>';
      }
      
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  }

  window.loadAllBookingsPage = loadAllBookings;

  window.updateStatus = async (bookingId, newStatus) => {
    try {
      await apiFetch(`/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      showToast('Status updated successfully', 'success');
      // Update badge visually directly avoiding full reload for speed
      const badge = document.getElementById(`badge-${bookingId}`);
      if(badge) {
        badge.className = `badge ${newStatus.toLowerCase()}`;
        badge.innerText = newStatus;
      }
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'error');
    }
  };

  const modalHtml = `
    <div id="booking-modal" class="modal">
      <div class="modal-content" style="max-width: 800px;">
        <span class="close" onclick="document.getElementById('booking-modal').classList.remove('active')">&times;</span>
        <h2 id="bm-title">Booking Details</h2>
        <div id="bm-body" style="margin-top: 1.5rem;"></div>
      </div>
    </div>

    <div id="category-modal" class="modal">

      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Category</h3>
        </div>
        <form id="category-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="cat-name" required placeholder="e.g. Wedding">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="cat-desc" required placeholder="Describe the category..."></textarea>
          </div>
          <div class="form-group">
            <label>Category Image</label>
            <input type="file" id="cat-image" accept="image/*">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary small" id="cancel-modal">Cancel</button>
            <button type="submit" class="btn primary small">Create Category</button>
          </div>
        </form>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', modalHtml);

  async function loadCategories() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div style="margin-bottom: 2rem; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size: 1.5rem;">Event Categories</h3>
        <button class="btn primary" id="btn-open-modal">+ Add Category</button>
      </div>
      <div id="cats-list"><p>Loading categories...</p></div>
    `;
    
    document.getElementById('btn-open-modal').onclick = () => {
      document.getElementById('category-modal').classList.add('active');
    };

    try {
      const data = await apiFetch('/customer/categories');
      const categories = data.data || data.categories || data;
      
      let html = '<div class="grid-list">';
      categories.forEach(cat => {
        html += `
          <div class="card glass" style="padding:0; overflow:hidden;">
            ${cat.imageUrl ? `<img src="${cat.imageUrl}" style="width:100%; height:150px; object-fit:cover;">` : '<div style="width:100%; height:150px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#ccc;">No Image</div>'}
            <div style="padding: 1.5rem;">
              <h4 style="margin-bottom: 0.5rem;">${cat.name}</h4>
              <p style="font-size: 0.875rem; color: var(--text-muted); min-height: 3em;">${cat.description || ''}</p>
              <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
                <button class="btn primary small" onclick="window.loadOptions('${cat.id}', '${cat.name}')">Options</button>
                <button class="btn secondary small" onclick="window.deleteCategory('${cat.id}')">Delete</button>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      document.getElementById('cats-list').innerHTML = html;
    } catch (err) {
      document.getElementById('cats-list').innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  }

  // Option Management
  window.loadOptions = async (catId, catName) => {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div style="margin-bottom: 2rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <button class="btn secondary small" onclick="window.backToCategories()" style="margin-bottom: 0.5rem;">← Back to Categories</button>
          <h3 style="font-size: 1.5rem;">Options for ${catName}</h3>
        </div>
        <button class="btn primary" id="btn-open-opt-modal">+ Add Option</button>
      </div>
      <div id="opts-list"><p>Loading options...</p></div>

      <!-- Option Modal -->
      <div id="option-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="opt-modal-title">Add New Option to ${catName}</h3>
          </div>
          <form id="option-form">
            <input type="hidden" id="opt-cat-id" value="${catId}">
            <input type="hidden" id="opt-parent-id" value="">
            <div class="form-group">
              <label>Type</label>
              <select id="opt-type" required>
                <option value="FOOD">Food</option>
                <option value="DECOR">Decor</option>
                <option value="VENUE">Venue</option>
                <option value="ADD_ON">Add-on</option>
              </select>
            </div>
            <div class="form-group">
              <label>Name</label>
              <input type="text" id="opt-name" required placeholder="e.g. Premium Buffet">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea id="opt-desc" placeholder="Details about this option..."></textarea>
            </div>
            <div class="form-group">
              <label>Price ($)</label>
              <input type="number" id="opt-price" step="0.01" value="0" required>
            </div>
            <div class="form-group">
              <label>Option Image</label>
              <input type="file" id="opt-image" accept="image/*">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn secondary small" id="cancel-opt-modal">Cancel</button>
              <button type="submit" class="btn primary small" id="opt-submit-btn">Create Option</button>
            </div>
          </form>
        </div>
      </div>

    `;

    document.getElementById('btn-open-opt-modal').onclick = () => {
      document.getElementById('opt-modal-title').innerText = `Add New Option to ${catName}`;
      document.getElementById('opt-parent-id').value = '';
      document.getElementById('option-modal').classList.add('active');
    };

    window.openSubOptionModal = (parentId, parentName) => {
      document.getElementById('opt-modal-title').innerText = `Add Sub-item to ${parentName}`;
      document.getElementById('opt-parent-id').value = parentId;
      document.getElementById('option-modal').classList.add('active');
    };

    document.getElementById('cancel-opt-modal').onclick = () => {
      document.getElementById('option-modal').classList.remove('active');
      document.getElementById('option-form').reset();
    };

    document.getElementById('option-form').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('categoryId', document.getElementById('opt-cat-id').value);
      formData.append('type', document.getElementById('opt-type').value);
      formData.append('name', document.getElementById('opt-name').value);
      formData.append('description', document.getElementById('opt-desc').value);
      formData.append('price', document.getElementById('opt-price').value);
      const parentId = document.getElementById('opt-parent-id').value;
      if (parentId) {
        formData.append('parentId', parentId);
      }
      const fileInput = document.getElementById('opt-image');
      if (fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      try {
        await apiFetch('/admin/options', {
          method: 'POST',
          body: formData
        });
        document.getElementById('option-modal').classList.remove('active');
        document.getElementById('option-form').reset();
        window.loadOptions(catId, catName); // reload list
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };


    try {
      const data = await apiFetch(`/customer/categories/${catId}/options`);
      const options = data.data || data.options || data;
      
      const mainOptions = options.filter(opt => !opt.parentId);
      const subOptions = options.filter(opt => opt.parentId);

      let html = '<div class="grid-list">';
      mainOptions.forEach(opt => {
        const itemSubs = subOptions.filter(s => s.parentId === opt.id);
        html += `
          <div class="card glass" style="padding:0; overflow:hidden; border: 1px solid var(--border);">
            ${opt.imageUrl ? `<img src="${opt.imageUrl}" style="width:100%; height:120px; object-fit:cover;">` : '<div style="width:100%; height:120px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#ccc;">No Image</div>'}
            <div style="padding: 1rem;">
              <span style="font-size: 0.65rem; text-transform:uppercase; color:var(--accent); font-weight:700;">${opt.type}</span>
              <h4 style="margin: 0.25rem 0;">${opt.name}</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted);">₹${opt.price}</p>
              
              ${itemSubs.length > 0 ? `
                <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed #eee;">
                  <p style="font-size: 0.7rem; font-weight:700; color:#888; margin-bottom: 0.5rem;">SUB-ITEMS:</p>
                  <ul style="list-style:none; padding:0; margin:0;">
                    ${itemSubs.map(s => `
                      <li style="font-size: 0.75rem; display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.3rem; background:#f9f9f9; padding: 0.25rem 0.5rem; border-radius:4px;">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          ${s.imageUrl ? `<img src="${s.imageUrl}" style="width:24px; height:24px; object-fit:cover; border-radius:4px;">` : '<div style="width:24px; height:24px; background:#eee; border-radius:4px;"></div>'}
                          <span>${s.name} (₹${s.price})</span>
                        </div>
                        <button onclick="window.deleteOption('${s.id}', '${catId}', '${catName}')" style="background:none; border:none; color:red; cursor:pointer; font-size:0.7rem;">×</button>
                      </li>
                    `).join('')}

                  </ul>
                </div>
              ` : ''}

              <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                <button class="btn secondary small" style="flex:1; padding:0.25rem; font-size:0.7rem;" onclick="window.openSubOptionModal('${opt.id}', '${opt.name}')">+ Sub-item</button>
                <button class="btn secondary small" style="padding:0.25rem; font-size:0.7rem;" onclick="window.deleteOption('${opt.id}', '${catId}', '${catName}')">Delete</button>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      if (mainOptions.length === 0) html = '<p>No main options yet for this category.</p>';
      document.getElementById('opts-list').innerHTML = html;
    } catch (err) {
      document.getElementById('opts-list').innerHTML = `<div class="error-msg">${err.message}</div>`;
    }

  };

  window.backToCategories = () => {
    updateTabs('cats');
    loadCategories();
  };

  window.deleteOption = async (id, catId, catName) => {
    if(!confirm("Delete this option?")) return;
    try {
      await apiFetch(`/admin/options/${id}`, { method: 'DELETE' });
      window.loadOptions(catId, catName);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  window.deleteBooking = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiFetch(`/admin/bookings/${id}`, { method: 'DELETE' });
      window.loadBookings();
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

      window.viewBookingDetails = async (id) => {
        try {
          const b = await apiFetch(`/admin/bookings/${id}`);
          const modal = document.getElementById('booking-modal');
          const body = document.getElementById('bm-body');
          
          // Grouping logic
          const groups = {};
          b.selectedOptions.forEach(opt => {
            if (!groups[opt.type]) groups[opt.type] = { main: [], sub: [] };
            if (opt.parentId) {
              groups[opt.type].sub.push(opt);
            } else {
              groups[opt.type].main.push(opt);
            }
          });

          body.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; background: #f8f9fa; padding: 1.5rem; border-radius: 12px; border: 1px solid #eee;">
              <div>
                <h3 style="margin-bottom: 0.8rem; font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Customer</h3>
                <p style="font-size: 1.1rem; font-weight: 700; margin: 0;">${b.user.name}</p>
                <p style="color: #666; margin: 0.2rem 0;">${b.user.email}</p>
                <p style="color: #666; margin: 0;">${b.user.phone || 'No Phone'}</p>
              </div>
              <div>
                <h3 style="margin-bottom: 0.8rem; font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Booking Info</h3>
                <p style="font-size: 1.1rem; font-weight: 700; margin: 0;">${b.category.name}</p>
                <p style="color: #666; margin: 0.2rem 0;">Event Date: ${new Date(b.eventDate).toLocaleDateString()}</p>
                <div>Status: <span class="badge ${b.status.toLowerCase()}">${b.status}</span></div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 2rem;">
              ${Object.keys(groups).map(type => {
                const group = groups[type];
                return `
                  <div style="border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: #fdfdfd; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                      <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--primary);">
                        <span style="width: 8px; height: 8px; background: var(--accent); border-radius: 50%;"></span>
                        ${type}
                      </h3>
                      <span style="font-size: 0.8rem; font-weight: 700; color: #999;">${group.main.length + group.sub.length} ITEMS</span>
                    </div>
                    
                    <div style="padding: 1rem 1.5rem;">
                      ${group.main.map(mainOpt => {
                        const children = group.sub.filter(s => s.parentId === mainOpt.id);
                        return `
                          <div style="margin-bottom: 1.5rem; last-child { margin-bottom: 0; }">
                            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
                              ${mainOpt.imageUrl ? `<img src="${mainOpt.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` : '<div style="width:50px; height:50px; background:#f0f0f0; border-radius:8px;"></div>'}
                              <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                  <span style="font-weight: 700; font-size: 1rem;">${mainOpt.name}</span>
                                  <span style="font-weight: 700; color: var(--primary);">₹${mainOpt.price}</span>
                                </div>
                                ${mainOpt.isCustom ? '<span style="font-size: 0.65rem; background: var(--accent); color: #fff; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700;">CUSTOM REQUEST</span>' : ''}
                              </div>
                            </div>

                            ${children.length > 0 ? `
                              <div style="margin-left: 2.5rem; padding-left: 1rem; border-left: 2px solid #f0f0f0; display: flex; flex-direction: column; gap: 0.5rem;">
                                ${children.map(child => `
                                  <div style="display: flex; justify-content: space-between; align-items: center; background: #fafafa; padding: 0.5rem 1rem; border-radius: 6px;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                      ${child.imageUrl ? `<img src="${child.imageUrl}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">` : '<div style="width:30px; height:30px; background:#eee; border-radius:4px;"></div>'}
                                      <span style="font-size: 0.9rem; color: #444;">${child.name}</span>
                                    </div>
                                    <span style="font-weight: 600; font-size: 0.9rem; color: #666;">₹${child.price}</span>
                                  </div>
                                `).join('')}
                              </div>
                            ` : ''}
                          </div>
                        `;
                      }).join('')}

                      ${/* Handle orphaned sub-items or custom requests without parent in main list */
                        group.sub.filter(s => !group.main.find(m => m.id === s.parentId)).map(orphan => `
                           <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                              ${orphan.imageUrl ? `<img src="${orphan.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` : '<div style="width:50px; height:50px; background:#f0f0f0; border-radius:8px;"></div>'}
                              <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                  <span style="font-weight: 700; font-size: 1rem;">${orphan.name}</span>
                                  <span style="font-weight: 700; color: var(--primary);">₹${orphan.price}</span>
                                </div>
                                <span style="font-size: 0.65rem; color: #999;">${orphan.isCustom ? 'CUSTOM REQUEST' : 'ADDITIONAL ITEM'}</span>
                              </div>
                            </div>
                        `).join('')
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top: 2.5rem; padding: 2rem; background: var(--primary); color: #fff; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 1rem; opacity: 0.8; display: block; margin-bottom: 0.3rem;">Total Amount</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Including all selected options & requests</span>
              </div>
              <span style="font-size: 2.5rem; font-weight: 800;">₹${b.selectedOptions.reduce((acc, curr) => acc + curr.price, 0)}</span>
            </div>
          `;
          
          modal.classList.add('active');
        } catch (err) { showToast('Error fetching details: ' + err.message, 'error'); }
      };


  // Modal Handlers
  document.getElementById('cancel-modal').onclick = () => {
    document.getElementById('category-modal').classList.remove('active');
  };

  document.getElementById('category-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    const description = document.getElementById('cat-desc').value;
    const fileInput = document.getElementById('cat-image');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (fileInput.files[0]) {
      formData.append('image', fileInput.files[0]);
    }

    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: formData
      });
      document.getElementById('category-modal').classList.remove('active');
      document.getElementById('category-form').reset();
      loadCategories();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  window.deleteCategory = async (id) => {
    if(!confirm("Are you sure? This will delete associated options.")) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }
}
