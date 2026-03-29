export function showPaymentGateway(amount, onSuccess, onFailure) {
  const overlay = document.createElement('div');
  overlay.id = 'payment-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideUp 0.3s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .payment-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .payment-body {
        padding: 2rem;
      }
      .payment-amount {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }
      .payment-amount-label {
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      .payment-amount-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1a1a2e;
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      .form-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }
      .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s;
        font-family: inherit;
      }
      .form-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      .form-input::placeholder {
        color: #999;
      }
      .form-row {
        display: flex;
        gap: 1rem;
      }
      .form-col {
        flex: 1;
      }
      .card-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
      }
      .payment-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }
      .payment-btn {
        flex: 1;
        padding: 1rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
      }
      .payment-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .payment-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      .payment-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .payment-btn-secondary {
        background: #f0f0f0;
        color: #666;
      }
      .payment-btn-secondary:hover {
        background: #e0e0e0;
      }
      .payment-secure {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.75rem;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      .error-text {
        color: #dc2626;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
    </style>

    <div class="payment-header">
      <div>
        <div style="font-size: 1.25rem; font-weight: 700;">Card Payment</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">Sandbox Mode</div>
      </div>
      <button id="payment-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.25rem;">×</button>
    </div>

    <div class="payment-body">
      <div class="payment-amount">
        <div class="payment-amount-label">Amount to Pay</div>
        <div class="payment-amount-value">₹${amount.toFixed(2)}</div>
      </div>

      <form id="card-form">
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <div style="position: relative;">
            <input 
              type="text" 
              class="form-input" 
              id="card-number" 
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              required
            />
            <span class="card-icon" id="card-brand">💳</span>
          </div>
          <div class="error-text" id="card-number-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label">Cardholder Name</label>
          <input 
            type="text" 
            class="form-input" 
            id="card-name" 
            placeholder="JOHN DOE"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-col">
            <label class="form-label">Expiry Date</label>
            <input 
              type="text" 
              class="form-input" 
              id="card-expiry" 
              placeholder="MM/YY"
              maxlength="5"
              required
            />
            <div class="error-text" id="card-expiry-error"></div>
          </div>
          <div class="form-col">
            <label class="form-label">CVV</label>
            <input 
              type="text" 
              class="form-input" 
              id="card-cvv" 
              placeholder="123"
              maxlength="3"
              required
            />
            <div class="error-text" id="card-cvv-error"></div>
          </div>
        </div>

        <div class="payment-actions">
          <button type="button" class="payment-btn payment-btn-secondary" id="payment-cancel">Cancel</button>
          <button type="submit" class="payment-btn payment-btn-primary" id="payment-submit">Pay ₹${amount.toFixed(2)}</button>
        </div>
      </form>

      <div class="payment-secure">
        <span>🔒</span>
        <span>Secured by 256-bit SSL encryption</span>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Card number formatting
  const cardNumberInput = document.getElementById('card-number');
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;

    // Detect card type
    const cardBrand = document.getElementById('card-brand');
    if (value.startsWith('4')) cardBrand.textContent = '💳'; // Visa
    else if (value.startsWith('5')) cardBrand.textContent = '💳'; // Mastercard
    else if (value.startsWith('3')) cardBrand.textContent = '💳'; // Amex
    else cardBrand.textContent = '💳';
  });

  // Expiry date formatting
  const expiryInput = document.getElementById('card-expiry');
  expiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });

  // CVV - numbers only
  const cvvInput = document.getElementById('card-cvv');
  cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Name - uppercase
  const nameInput = document.getElementById('card-name');
  nameInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  // Close handlers
  const closePayment = () => {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById('payment-close').addEventListener('click', () => {
    closePayment();
    if (onFailure) onFailure('Payment cancelled by user');
  });

  document.getElementById('payment-cancel').addEventListener('click', () => {
    closePayment();
    if (onFailure) onFailure('Payment cancelled by user');
  });

  // Form validation and submission
  document.getElementById('card-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const cardNumber = cardNumberInput.value.replace(/\s/g, '');
    const cardName = nameInput.value;
    const cardExpiry = expiryInput.value;
    const cardCvv = cvvInput.value;

    // Validation
    let isValid = true;

    // Card number validation (Luhn algorithm)
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      document.getElementById('card-number-error').textContent = 'Invalid card number';
      isValid = false;
    } else {
      document.getElementById('card-number-error').textContent = '';
    }

    // Expiry validation
    const [month, year] = cardExpiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12 || 
        parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      document.getElementById('card-expiry-error').textContent = 'Invalid or expired date';
      isValid = false;
    } else {
      document.getElementById('card-expiry-error').textContent = '';
    }

    // CVV validation
    if (cardCvv.length < 3) {
      document.getElementById('card-cvv-error').textContent = 'Invalid CVV';
      isValid = false;
    } else {
      document.getElementById('card-cvv-error').textContent = '';
    }

    if (!isValid) return;

    // Show processing
    modal.querySelector('.payment-body').innerHTML = `
      <div style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
        <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Processing Payment...</div>
        <div style="font-size: 0.875rem; color: #666;">Please wait while we verify your card</div>
      </div>
    `;

    // Simulate payment processing (3 seconds)
    setTimeout(() => {
      // 90% success rate in sandbox
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        modal.querySelector('.payment-body').innerHTML = `
          <div style="text-align: center; padding: 3rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #059669; margin-bottom: 0.5rem;">Payment Successful!</div>
            <div style="font-size: 0.875rem; color: #666; margin-bottom: 2rem;">Your booking has been confirmed</div>
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
              <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.25rem;">Transaction ID</div>
              <div style="font-weight: 600; color: #059669;">TXN${Date.now()}</div>
            </div>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
              <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">Payment Details</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span style="font-size: 0.875rem; color: #666;">Card</span>
                <span style="font-size: 0.875rem; font-weight: 600;">**** ${cardNumber.slice(-4)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.875rem; color: #666;">Amount</span>
                <span style="font-size: 0.875rem; font-weight: 600;">₹${amount.toFixed(2)}</span>
              </div>
            </div>
            <button class="payment-btn payment-btn-primary" id="payment-done" style="width: 100%;">Done</button>
          </div>
        `;

        document.getElementById('payment-done').addEventListener('click', () => {
          closePayment();
          if (onSuccess) onSuccess({ 
            transactionId: `TXN${Date.now()}`, 
            cardLast4: cardNumber.slice(-4),
            amount: amount
          });
        });
      } else {
        modal.querySelector('.payment-body').innerHTML = `
          <div style="text-align: center; padding: 3rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">❌</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;">Payment Failed</div>
            <div style="font-size: 0.875rem; color: #666; margin-bottom: 2rem;">Your card was declined. Please try another card.</div>
            <button class="payment-btn payment-btn-primary" id="payment-retry" style="width: 100%;">Try Again</button>
          </div>
        `;

        document.getElementById('payment-retry').addEventListener('click', () => {
          closePayment();
          if (onFailure) onFailure('Payment failed - card declined');
        });
      }
    }, 3000);
  });
}
