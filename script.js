// Global state
let selectedSpeed = 'instant';
let paymentData = {
    amount: '250.00',
    recipient: 'Sarah Johnson',
    account: '4829',
    routing: '021000021'
};

// DOM Elements
const transferScreen = document.getElementById('transfer-screen');
const confirmationModal = document.getElementById('confirmation-modal');
const successScreen = document.getElementById('success-screen');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    simulateBankCheck();
});

function initializeForm() {
    // Pre-fill some demo data
    document.getElementById('recipient').value = paymentData.recipient;
    document.getElementById('amount').value = paymentData.amount;
    document.getElementById('account').value = `************${paymentData.account}`;
    document.getElementById('routing').value = paymentData.routing;
    document.getElementById('memo').value = 'Rent payment';
    
    // Select instant by default
    selectSpeed('instant');
}

function setupEventListeners() {
    // Amount input formatting
    const amountInput = document.getElementById('amount');
    amountInput.addEventListener('input', formatAmountInput);
    
    // Form validation
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', updateContinueButton);
    });
    
    // Modal close events
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            hideConfirmation();
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmationModal.classList.contains('show')) {
            hideConfirmation();
        }
    });
}

function formatAmountInput(e) {
    let value = e.target.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    e.target.value = value;
    paymentData.amount = value;
    updateConfirmationAmounts();
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove any existing error states
    input.classList.remove('error');
    
    // Validate based on input type
    switch (input.id) {
        case 'routing':
            if (value.length !== 9 || !/^\d+$/.test(value)) {
                showInputError(input, 'Routing number must be 9 digits');
            }
            break;
        case 'account':
            if (value.length < 4) {
                showInputError(input, 'Please enter a valid account number');
            }
            break;
        case 'amount':
            const amount = parseFloat(value);
            if (isNaN(amount) || amount <= 0) {
                showInputError(input, 'Please enter a valid amount');
            } else if (amount > 10000) {
                showInputError(input, 'Amount cannot exceed $10,000');
            }
            break;
    }
}

function showInputError(input, message) {
    input.classList.add('error');
    // In a real app, you'd show the error message
    console.log(`Validation error for ${input.id}: ${message}`);
}

function updateContinueButton() {
    const continueBtn = document.querySelector('.primary-button');
    const isFormValid = validateForm();
    
    continueBtn.disabled = !isFormValid;
    continueBtn.style.opacity = isFormValid ? '1' : '0.6';
}

function validateForm() {
    const recipient = document.getElementById('recipient').value.trim();
    const routing = document.getElementById('routing').value.trim();
    const account = document.getElementById('account').value.trim();
    const amount = document.getElementById('amount').value.trim();
    
    return recipient && routing.length === 9 && account.length >= 4 && 
           parseFloat(amount) > 0 && parseFloat(amount) <= 10000;
}

function selectSpeed(speed) {
    selectedSpeed = speed;
    
    // Update UI
    document.querySelectorAll('.speed-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`.speed-option.${speed}`).classList.add('selected');
    
    // Update routing info based on selection
    updateRoutingInfo(speed);
}

function updateRoutingInfo(speed) {
    const routingInfo = document.querySelector('.routing-info');
    const routingBadge = document.querySelector('.routing-badge');
    
    if (speed === 'instant') {
        routingBadge.innerHTML = `
            <span class="routing-icon">✓</span>
            <span>Recipient bank supports FedNow - Instant delivery available</span>
        `;
        routingInfo.style.background = '#dcfce7';
        routingInfo.style.borderColor = '#10b981';
        routingBadge.style.color = '#059669';
    } else {
        routingBadge.innerHTML = `
            <span class="routing-icon">🏦</span>
            <span>Payment will be sent via Same-Day ACH</span>
        `;
        routingInfo.style.background = '#f1f5f9';
        routingInfo.style.borderColor = '#cbd5e1';
        routingBadge.style.color = '#64748b';
    }
}

function simulateBankCheck() {
    setTimeout(() => {
        updateRoutingInfo(selectedSpeed);
    }, 2000);
}

function showConfirmation() {
    if (!validateForm()) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    // Update confirmation modal with current data
    updateConfirmationData();
    
    // Show modal with animation
    confirmationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideConfirmation() {
    confirmationModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function updateConfirmationData() {
    const amount = document.getElementById('amount').value;
    const recipient = document.getElementById('recipient').value;
    const account = document.getElementById('account').value;
    
    // Update confirmation modal
    document.getElementById('confirm-amount').textContent = amount;
    document.getElementById('confirm-recipient').textContent = recipient;
    document.getElementById('confirm-account').textContent = `•••• ${account.slice(-4)}`;
    
    updateConfirmationAmounts();
    updateSpeedConfirmation();
}

function updateConfirmationAmounts() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const fee = selectedSpeed === 'instant' ? 1.99 : 0;
    const total = amount + fee;
    
    document.getElementById('payment-amount').textContent = amount.toFixed(2);
    document.getElementById('total-amount').textContent = total.toFixed(2);
    document.getElementById('button-amount').textContent = total.toFixed(2);
}

function updateSpeedConfirmation() {
    const speedConfirmation = document.querySelector('.speed-confirmation');
    
    if (selectedSpeed === 'instant') {
        speedConfirmation.innerHTML = `
            <div class="selected-speed">
                <div class="speed-badge">
                    <span class="speed-icon">⚡</span>
                    <span>Instant Payment</span>
                </div>
                <div class="delivery-time">Delivers in ~15 seconds</div>
            </div>
            <div class="fee-breakdown">
                <div class="fee-line">
                    <span>Payment amount</span>
                    <span>$<span id="payment-amount">${paymentData.amount}</span></span>
                </div>
                <div class="fee-line">
                    <span>Instant transfer fee</span>
                    <span>$1.99</span>
                </div>
                <div class="fee-line total">
                    <span>Total</span>
                    <span>$<span id="total-amount">${(parseFloat(paymentData.amount) + 1.99).toFixed(2)}</span></span>
                </div>
            </div>
        `;
    } else {
        speedConfirmation.innerHTML = `
            <div class="selected-speed" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-color: #cbd5e1;">
                <div class="speed-badge">
                    <span class="speed-icon">🏦</span>
                    <span>Standard Payment</span>
                </div>
                <div class="delivery-time" style="color: #6b7280;">Delivers by end of business day</div>
            </div>
            <div class="fee-breakdown">
                <div class="fee-line">
                    <span>Payment amount</span>
                    <span>$<span id="payment-amount">${paymentData.amount}</span></span>
                </div>
                <div class="fee-line">
                    <span>Transfer fee</span>
                    <span>Free</span>
                </div>
                <div class="fee-line total">
                    <span>Total</span>
                    <span>$<span id="total-amount">${paymentData.amount}</span></span>
                </div>
            </div>
        `;
    }
}

function processPayment() {
    // Hide confirmation modal
    hideConfirmation();
    
    // Show loading state
    showLoadingState();
    
    // Simulate payment processing
    setTimeout(() => {
        showSuccessScreen();
    }, selectedSpeed === 'instant' ? 1500 : 3000);
}

function showLoadingState() {
    // In a real app, you'd show a loading screen
    const continueBtn = document.querySelector('.primary-button');
    continueBtn.textContent = 'Processing...';
    continueBtn.classList.add('loading');
    continueBtn.disabled = true;
}

function showSuccessScreen() {
    // Hide transfer screen
    transferScreen.classList.remove('active');
    
    // Show success screen with animation
    successScreen.classList.add('active');
    successScreen.classList.add('fade-in');
    
    // Update success screen with payment data
    updateSuccessScreen();
}

function updateSuccessScreen() {
    // Update payment details in success screen
    const detailRows = document.querySelectorAll('.payment-details .detail-row');
    const amount = document.getElementById('amount').value;
    const recipient = document.getElementById('recipient').value;
    const account = document.getElementById('account').value;
    
    // Generate transaction ID
    const transactionId = `MN-2024-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // Update all detail values
    document.querySelector('.detail-row:nth-child(1) .detail-value').textContent = `$${amount}`;
    document.querySelector('.detail-row:nth-child(2) .detail-value').textContent = recipient;
    document.querySelector('.detail-row:nth-child(3) .detail-value').textContent = `•••• ${account.slice(-4)}`;
    document.querySelector('.detail-row:nth-child(6) .detail-value').textContent = transactionId;
    
    // Update timeline with current times
    const now = new Date();
    const times = [
        formatTime(new Date(now.getTime() - 15000)),
        formatTime(new Date(now.getTime() - 14000)),
        formatTime(now)
    ];
    
    const timeElements = document.querySelectorAll('.timeline-time');
    timeElements.forEach((element, index) => {
        element.textContent = times[index];
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function sendAnother() {
    // Reset form and return to transfer screen
    successScreen.classList.remove('active');
    transferScreen.classList.add('active');
    
    // Reset form
    document.getElementById('recipient').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('account').value = '';
    document.getElementById('memo').value = '';
    
    // Reset button state
    const continueBtn = document.querySelector('.primary-button');
    continueBtn.textContent = 'Continue';
    continueBtn.classList.remove('loading');
    continueBtn.disabled = false;
    
    // Reset speed selection
    selectSpeed('instant');
}

function viewTransactions() {
    // In a real app, this would navigate to transaction history
    alert('This would navigate to your transaction history.');
}

// Form enhancement functions
function enhanceFormExperience() {
    // Add real-time validation feedback
    const inputs = document.querySelectorAll('input[type="text"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
    });
}

// Bank routing simulation
function checkBankCapabilities(routingNumber) {
    // Simulate API call to check if bank supports FedNow
    return new Promise((resolve) => {
        setTimeout(() => {
            // Most major banks support FedNow in this simulation
            const supportsFedNow = Math.random() > 0.3; // 70% chance
            resolve(supportsFedNow);
        }, 1500);
    });
}

// Advanced features for production
function implementAdvancedFeatures() {
    // Implement biometric authentication
    if ('webauthn' in window) {
        addBiometricSupport();
    }
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
        addHapticFeedback();
    }
    
    // Implement accessibility features
    enhanceAccessibility();
}

function addBiometricSupport() {
    // Implementation for WebAuthn/Face ID/Touch ID
    console.log('Biometric authentication available');
}

function addHapticFeedback() {
    // Add subtle vibrations for button presses
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            navigator.vibrate(10);
        });
    });
}

function enhanceAccessibility() {
    // Add ARIA labels and keyboard navigation
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
    });
    
    // Add keyboard support for speed selection
    document.querySelectorAll('.speed-option').forEach((option, index) => {
        option.setAttribute('tabindex', '0');
        option.setAttribute('role', 'radio');
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const speed = option.classList.contains('instant') ? 'instant' : 'standard';
                selectSpeed(speed);
            }
        });
    });
}

// Call enhancement functions
document.addEventListener('DOMContentLoaded', function() {
    enhanceFormExperience();
    implementAdvancedFeatures();
});

// Error handling and retry logic
function handlePaymentError(error) {
    console.error('Payment processing error:', error);
    
    // Show error state
    const errorModal = document.createElement('div');
    errorModal.className = 'modal-overlay show';
    errorModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Payment Error</h2>
            </div>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; color: #ef4444; margin-bottom: 16px;">⚠️</div>
                <p>We're unable to process your payment right now. Please try again.</p>
            </div>
            <div class="modal-actions">
                <button class="primary-button" onclick="this.closest('.modal-overlay').remove()">
                    Try Again
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorModal);
}

// Analytics and tracking (placeholder)
function trackUserAction(action, data = {}) {
    console.log('Analytics:', action, data);
    // In production, this would send data to analytics service
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        selectSpeed,
        validateForm,
        formatAmountInput,
        updateConfirmationAmounts
    };
}