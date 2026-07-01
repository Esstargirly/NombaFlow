document.addEventListener('DOMContentLoaded', () => {
const form = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Password visibility toggle
let isVisible = false;
togglePassword.addEventListener('click', () => {
isVisible = !isVisible;
passwordInput.type = isVisible ? 'text' : 'password';
document.getElementById('eyeIcon').innerHTML = isVisible
? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// Clear errors on input
emailInput.addEventListener('input', () => emailError.classList.add('hidden'));
passwordInput.addEventListener('input', () => passwordError.classList.add('hidden'));

// Form submission
form.addEventListener('submit', async (e) => {
e.preventDefault();

// Basic validation
let valid = true;
if (!emailInput.value || !/\S+@\S+\.\S+/.test(emailInput.value)) {
  emailError.classList.remove('hidden');
  valid = false;
}
if (!passwordInput.value) {
  passwordError.classList.remove('hidden');
  valid = false;
}
if (!valid) return;

// Loading state
submitBtn.innerHTML = `
  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
  Signing in...
`;
submitBtn.disabled = true;

try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = 'dashboard.html';
  } else {
    showError(data.message || 'Invalid email or password.');
  }
} catch (err) {
  showError('Something went wrong. Please try again.');
} finally {
  submitBtn.innerHTML = `Login <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  submitBtn.disabled = false;
}

});

function showError(message) {
emailError.textContent = message;
emailError.classList.remove('hidden');
}
});