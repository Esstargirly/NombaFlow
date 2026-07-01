const API_BASE = '/api';

// Redirect to login if no token
const token = localStorage.getItem('token');
//if (!token) window.location.href = 'login.html';

// Format currency
function formatNaira(amount) {
return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format date
function formatDate(dateStr) {
const d = new Date(dateStr);
return {
date: d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
};
}

// Get initials
function getInitials(name) {
return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Status badge
function statusBadge(status) {
const s = status.toLowerCase();
if (s === 'paid' || s === 'success') {
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green/10 text-green"> <span class="w-1.5 h-1.5 rounded-full bg-green"></span> Paid </span>`;
}
if (s === 'pending') {
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-600"> <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Pending </span>`;
}
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500"> <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Failed </span>`;
}

// Render transactions
function renderTransactions(transactions) {
const tbody = document.getElementById('txTableBody');
const emptyState = document.getElementById('emptyState');
const txCountLabel = document.getElementById('txCountLabel');

if (!transactions || transactions.length === 0) {
tbody.innerHTML = '';
emptyState.classList.remove('hidden');
txCountLabel.textContent ='No transactions yet';
return;
}

emptyState.classList.add('hidden');
const recent = transactions.slice(0, 10);
txCountLabel.textContent = `Showing ${recent.length} of ${transactions.length} transactions`;

tbody.innerHTML = recent.map(tx => {
const { date, time } = formatDate(tx.created_at || tx.timestamp);
const initials = getInitials(tx.sender_name || 'Unknown');
return `<tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="window.location.href='transactions.html'"> <td class="px-6 py-4"> <div class="text-sm font-semibold text-navy">${date}</div> <div class="text-xs text-gray-400">${time}</div> </td> <td class="px-6 py-4"> <div class="flex items-center gap-2.5"> <div class="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-[11px] font-bold text-navy shrink-0">${initials}</div> <span class="text-sm font-semibold text-navy">${tx.sender_name || 'Unknown'}</span> </div> </td> <td class="px-6 py-4 text-right"> <span class="mono text-sm font-bold text-navy">${formatNaira(tx.amount)}</span> </td> <td class="px-6 py-4"> ${statusBadge(tx.status)} </td> </tr>`;
}).join('');
}

// Load dashboard data
async function loadDashboard() {
try {
const headers = { 'Authorization': `Bearer ${token}` };

// Fetch merchant + virtual account
const merchantRes = await fetch(`${API_BASE}/merchant/me`, { headers });
if (merchantRes.status === 401) {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
  return;
}
const merchant = await merchantRes.json();

// Update name
const name = merchant.business_name || merchant.owner_name || 'Merchant';
const initials = getInitials(name);
document.getElementById('welcomeText').textContent = `Welcome back, ${name.split(' ')[0]} 👋`;
document.getElementById('sidebarName').textContent = name;
document.getElementById('headerName').textContent = name;
document.getElementById('avatarCircle').textContent = initials;
document.getElementById('headerAvatar').textContent = initials;

// Update account details
if (merchant.virtual_account) {
  const acct = merchant.virtual_account;
  document.getElementById('accountNumber').textContent = acct.account_number || '—';
  document.getElementById('bankName').textContent = acct.bank_name || 'Nombank MFB';
  document.getElementById('accountName').textContent = acct.account_name || name;
}

// Fetch transactions
const txRes = await fetch(`${API_BASE}/transactions`, { headers });
const txData = await txRes.json();
const transactions = txData.transactions || txData || [];

// Stats
const paid = transactions.filter(t => ['paid', 'success'].includes(t.status?.toLowerCase()));
const total = paid.reduce((sum, t) => sum + Number(t.amount), 0);
document.getElementById('totalBalance').textContent = formatNaira(total);
document.getElementById('txCount').textContent = transactions.length;

// Month total
const now = new Date();
const monthPaid = paid.filter(t => {
  const d = new Date(t.created_at || t.timestamp);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
});
const monthTotal = monthPaid.reduce((sum, t) => sum + Number(t.amount), 0);
document.getElementById('monthTotal').textContent = `₦${formatNaira(monthTotal)}`;

renderTransactions(transactions);

// Search filter
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = transactions.filter(t =>
    (t.sender_name || '').toLowerCase().includes(query) ||
    String(t.amount).includes(query)
  );
  renderTransactions(filtered);
});

} catch (err) {
console.error('Dashboard load error:', err);
}
}

// Copy account number
document.getElementById('copyAccountBtn').addEventListener('click', () => {
const number = document.getElementById('accountNumber').textContent.trim();
if (number && number !== '— — — —') {
navigator.clipboard.writeText(number.replace(/\s/g, ''));
const btn = document.getElementById('copyAccountBtn');
btn.textContent = '✓ Copied!';
setTimeout(() => {
btn.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Number`;
}, 2000);
}
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
localStorage.removeItem('token');
window.location.href = 'login.html';
});

// Init
loadDashboard();