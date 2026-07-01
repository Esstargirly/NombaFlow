document.addEventListener('DOMContentLoaded', () => {
const form = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm_password');
const confirmError = document.getElementById('confirmError');
const termsError = document.getElementById('termsError');

// Get all fields and their error elements
const fields = [
{ input: document.getElementById('business_name'), errorIndex: 0 },
{ input: document.getElementById('owner_name'),    errorIndex: 1 },
{ input: document.getElementById('email'),         errorIndex: 2 },
{ input: passwordInput,                            errorIndex: 3 },
];

// Clear field error on input
fields.forEach(({ input }) => {
input.addEventListener('input', () => {
const err = input.closest('div').parentElement.querySelector('.error-msg');
if (err) err.classList.add('hidden');
input.classList.remove('border-red-400');
});
});

// Real-time password match check
confirmInput.addEventListener('input', () => {
if (confirmInput.value && confirmInput.value !== passwordInput.value) {
confirmError.classList.remove('hidden');
confirmInput.classList.add('border-red-400');
} else {
confirmError.classList.add('hidden');
confirmInput.classList.remove('border-red-400');
}
});

// Form submit
form.addEventListener('submit', async (e) => {
e.preventDefault();

let valid = true;

// Validate required fields
fields.forEach(({ input }) => {
  const err = input.closest('div').parentElement.querySelector('.error-msg');
  if (!input.value.trim()) {
    if (err) err.classList.remove('hidden');
    input.classList.add('border-red-400');
    valid = false;
  }
});

// Email format
const emailInput = document.getElementById('email');
if (emailInput.value && !/\S+@\S+\.\S+/.test(emailInput.value)) {
  emailInput.closest('div').parentElement.querySelector('.error-msg').classList.remove('hidden');
  emailInput.classList.add('border-red-400');
  valid = false;
}

// Password length
if (passwordInput.value && passwordInput.value.length < 8) {
  passwordInput.closest('div').parentElement.querySelector('.error-msg').classList.remove('hidden');
  passwordInput.classList.add('border-red-400');
  valid = false;
}

// Password match
if (confirmInput.value !== passwordInput.value) {
  confirmError.classList.remove('hidden');
  confirmInput.classList.add('border-red-400');
  valid = false;
}

// Terms
const terms = document.getElementById('terms');
if (!terms.checked) {
  termsError.classList.remove('hidden');
  valid = false;
} else {
  termsError.classList.add('hidden');
}

if (!valid) return;

// Loading state
submitBtn.innerHTML = `
  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
  Creating account...
`;
submitBtn.disabled = true;

try {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_name: document.getElementById('business_name').value.trim(),
      owner_name: document.getElementById('owner_name').value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = 'dashboard.html';
  } else {
    showFormError(data.message || 'Registration failed. Please try again.');
  }
} catch (err) {
  showFormError('Something went wrong. Please try again.');
} finally {
  submitBtn.innerHTML = `Create Account <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  submitBtn.disabled = false;
}

});

function showFormError(message) {
termsError.textContent = message;
termsError.classList.remove('hidden');
}
});