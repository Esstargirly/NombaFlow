const API_BASE = '/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

function getInitials(name) {
return (name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Show copy toast
function showToast(message) {
const toast = document.getElementById('copyToast');
toast.textContent = message;
toast.classList.remove('hidden');
setTimeout(() => toast.classList.add('hidden'), 2500);
}

// Copy account number
document.getElementById('copyBtn').addEventListener('click', () => {
const number = document.getElementById('accountNumber').textContent.trim();
if (number && number !== '— — — —') {
navigator.clipboard.writeText(number.replace(/\s/g, ''));
showToast('✓ Account number copied!');
}
});

// Share account info
document.getElementById('shareBtn').addEventListener('click', () => {
const number = document.getElementById('accountNumber').textContent.trim();
const bank = document.getElementById('bankName').textContent.trim();
const name = document.getElementById('accountName').textContent.trim();
const text = `Pay me via bank transfer:\nAccount Number: ${number}\nBank: ${bank}\nAccount Name: ${name}`;

if (navigator.share) {
navigator.share({ title: 'NombaFlow Account Details', text });
} else {
navigator.clipboard.writeText(text);
showToast('✓ Account info copied to clipboard!');
}
});

// Download account info as text file
document.getElementById('downloadBtn').addEventListener('click', () => {
const number = document.getElementById('accountNumber').textContent.trim();
const bank = document.getElementById('bankName').textContent.trim();
const name = document.getElementById('accountName').textContent.trim();
const business = document.getElementById('businessName').textContent.trim();
const email = document.getElementById('emailAddr').textContent.trim();

const content = [
'NombaFlow - Account Details',
'============================',
`Business Name:   ${business}`,
`Account Name:    ${name}`,
`Account Number:  ${number}`,
`Bank:            ${bank}`,
`Email:           ${email}`,
'',
`Generated: ${new Date().toLocaleDateString('en-NG')}`,
].join('\n');

const blob = new Blob([content], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'nombaflow-account-details.txt';
a.click();
URL.revokeObjectURL(url);
});

// Load merchant data
async function loadAccount() {
try {
const headers = { 'Authorization': `Bearer ${token}` };
const res = await fetch(`${API_BASE}/merchant/me`, { headers });

if (res.status === 401) {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
  return;
}

const merchant = await res.json();
const name = merchant.business_name || merchant.owner_name || 'Merchant';
const initials = getInitials(name);

// Sidebar & header
document.getElementById('sidebarName').textContent = name;
document.getElementById('sidebarAvatar').textContent = initials;
document.getElementById('headerAvatar').textContent = initials;
document.getElementById('headerName').textContent = name;

// Business info
document.getElementById('businessName').textContent = merchant.business_name || '—';
document.getElementById('ownerName').textContent = merchant.owner_name || '—';
document.getElementById('emailAddr').textContent = merchant.email || '—';

// Virtual account
if (merchant.virtual_account) {
  const acct = merchant.virtual_account;
  document.getElementById('accountNumber').textContent = acct.account_number || '—';
  document.getElementById('bankName').textContent = acct.bank_name || 'Nombank MFB';
  document.getElementById('accountName').textContent = (acct.account_name || name).toUpperCase();
  document.getElementById('accountRef').textContent = acct.account_reference || merchant.id || '—';
}

} catch (err) {
console.error('Account load error:', err);
}
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
localStorage.removeItem('token');
window.location.href = 'login.html';
});

loadAccount();