const API_BASE = '/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

function getInitials(name) {
return (name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function showToast(message, success = true) {
const toast = document.getElementById('toast');
toast.textContent = message;
toast.className = `px-4 py-3 rounded-xl text-sm font-semibold text-center ${ success ? 'bg-green/10 text-green border border-green/20' : 'bg-red-50 text-red-500 border border-red-100' }`;
toast.classList.remove('hidden');
setTimeout(() => toast.classList.add('hidden'), 3000);
}

function togglePassword(inputId, iconId) {
const input = document.getElementById(inputId);
const icon = document.getElementById(iconId);
const isVisible = input.type === 'text';
input.type = isVisible ? 'password' : 'text';
icon.innerHTML = isVisible
? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
: `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

// Load merchant data
async function loadSettings() {
try {
const res = await fetch(`${API_BASE}/merchant/me`, {
headers: { 'Authorization': `Bearer ${token}` }
});
if (res.status === 401) { localStorage.removeItem('token'); window.location.href = 'login.html'; return; }
const merchant = await res.json();

const name = merchant.business_name || merchant.owner_name || 'Merchant';
const initials = getInitials(name);

document.getElementById('sidebarName').textContent = name;
document.getElementById('sidebarAvatar').textContent = initials;
document.getElementById('headerAvatar').textContent = initials;
document.getElementById('headerName').textContent = name;

document.getElementById('businessName').value = merchant.business_name || '';
document.getElementById('ownerName').value = merchant.owner_name || '';
document.getElementById('email').value = merchant.email || '';

} catch (err) {
console.error('Settings load error:', err);
}
}

// Save profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
e.preventDefault();
const btn = document.getElementById('saveProfileBtn');
btn.textContent = 'Saving…';
btn.disabled = true;

try {
const res = await fetch(`${API_BASE}/merchant/update`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
},
body: JSON.stringify({
business_name: document.getElementById('businessName').value.trim(),
owner_name: document.getElementById('ownerName').value.trim(),
})
});

if (res.ok) {
  showToast('Profile updated successfully!');
} else {
  const data = await res.json();
  showToast(data.message || 'Failed to update profile.', false);
}

} catch (err) {
showToast('Something went wrong. Please try again.', false);
} finally {
btn.innerHTML = `Save Changes <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
btn.disabled = false;
}
});

// Update password
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
e.preventDefault();
const newPass = document.getElementById('newPassword').value;
const confirmPass = document.getElementById('confirmPassword').value;
const matchError = document.getElementById('passwordMatchError');

if (newPass !== confirmPass) {
matchError.classList.remove('hidden');
return;
}
matchError.classList.add('hidden');

const btn = document.getElementById('updatePasswordBtn');
btn.textContent = 'Updating…';
btn.disabled = true;

try {
const res = await fetch(`${API_BASE}/merchant/change-password`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
},
body: JSON.stringify({
current_password: document.getElementById('currentPassword').value,
new_password: newPass,
})
});

if (res.ok) {
  showToast('Password updated successfully!');
  document.getElementById('passwordForm').reset();
} else {
  const data = await res.json();
  showToast(data.message || 'Failed to update password.', false);
}

} catch (err) {
showToast('Something went wrong. Please try again.', false);
} finally {
btn.innerHTML = `Update Password <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
btn.disabled = false;
}
});

// Logout
function logout() {
localStorage.removeItem('token');
window.location.href = 'login.html';
}
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('logoutBtnBottom').addEventListener('click', logout);

loadSettings();