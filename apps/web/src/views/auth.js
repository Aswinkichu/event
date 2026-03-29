import { apiFetch, setToken, setUserRole } from '../api.js';

export function renderAuth(container) {
  container.innerHTML = `
    <div class="auth-wrapper animate-fade-in">
      <div class="auth-card glass">
        <h2 id="auth-title">Login</h2>
        <form id="auth-form">
          <div class="input-group register-field" style="display: none;">
            <label>Name</label>
            <input type="text" id="name" placeholder="John Doe">
          </div>
          
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="email" required placeholder="john@example.com">
          </div>
          
          <div class="input-group">
            <label>Password</label>
            <input type="password" id="password" required placeholder="••••••••">
          </div>
          
          <div class="input-group register-field" style="display: none;">
            <label>Phone</label>
            <input type="text" id="phone" placeholder="9876543210">
          </div>
          
          <div class="input-group register-field" style="display: none;">
            <label>Country Code</label>
            <input type="text" id="countryCode" placeholder="+1">
          </div>
          
          <button type="submit" class="btn primary w-100" id="auth-submit">Log In</button>
        </form>
        <p class="auth-switch" id="auth-switch">Don't have an account? <span class="highlight">Register</span></p>
        <div id="auth-error" class="error-msg"></div>
      </div>
    </div>
  `;

  let isLogin = true;
  
  const form = document.getElementById('auth-form');
  const title = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit');
  const switchBtn = document.getElementById('auth-switch');
  const errorDiv = document.getElementById('auth-error');
  const registerFields = document.querySelectorAll('.register-field');

  switchBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    title.innerText = isLogin ? 'Login' : 'Register';
    submitBtn.innerText = isLogin ? 'Log In' : 'Sign Up';
    switchBtn.innerHTML = isLogin 
      ? `Don't have an account? <span class="highlight">Register</span>`
      : `Already have an account? <span class="highlight">Login</span>`;
      
    registerFields.forEach(f => f.style.display = isLogin ? 'none' : 'block');
    errorDiv.innerText = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.innerText = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      if (isLogin) {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setToken(res.accessToken);
        setUserRole(res.role);
        window.location.reload();
      } else {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const countryCode = document.getElementById('countryCode').value;
        
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, phone, countryCode })
        });
        
        // Auto switch to login after successful register
        showToast('Registered successfully! Please login.', 'success');
        switchBtn.click();
      }
    } catch (err) {
      errorDiv.innerHTML = err.message.replace(/\n/g, '<br>');
    }
  });
}
