const API_BASE = '/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const PER_PAGE = 10;
let allTransactions = [];
let filtered = [];
let currentPage = 1;

// Helpers
function formatNaira(amount) {
return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
const d = new Date(dateStr);
return {
date: d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
};
}

function getInitials(name) {
return (name || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function statusBadge(status) {
const s = (status || '').toLowerCase();
if (s === 'paid' || s === 'success') {
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green/10 text-green"> <span class="w-1.5 h-1.5 rounded-full bg-green"></span>Paid</span>`;
}
if (s === 'pending') {
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-600"> <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>Pending</span>`;
}
return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500"> <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>Failed</span>`;
}

// Render table
function renderTable(data, page) {
const tbody = document.getElementById('txTableBody');
const emptyState = document.getElementById('emptyState');
const paginationLabel = document.getElementById('paginationLabel');

if (!data.length) {
tbody.innerHTML = '';
emptyState.classList.remove('hidden');
paginationLabel.textContent = 'No transactions found';
renderPageNumbers(0, 1);
return;
}

emptyState.classList.add('hidden');
const start = (page - 1) * PER_PAGE;
const end = Math.min(start + PER_PAGE, data.length);
const pageData = data.slice(start, end);
const totalPages = Math.ceil(data.length / PER_PAGE);

paginationLabel.textContent = `Showing ${start + 1}–${end} of ${data.length} transactions`;

tbody.innerHTML = pageData.map(tx => {
const { date, time } = formatDate(tx.created_at || tx.timestamp);
const initials = getInitials(tx.sender_name);
const ref = tx.reference || tx.id || '—';
return `<tr class="hover:bg-gray-50 transition-colors"> <td class="px-6 py-4"> <div class="text-sm font-semibold text-navy">${date}</div> <div class="text-xs text-gray-400">${time}</div> </td> <td class="px-6 py-4"> <span class="mono text-xs text-gray-400">${ref}</span> </td> <td class="px-6 py-4"> <div class="flex items-center gap-2.5"> <div class="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-[11px] font-bold text-navy shrink-0">${initials}</div> <span class="text-sm font-semibold text-navy">${tx.sender_name || 'Unknown'}</span> </div> </td> <td class="px-6 py-4 text-right"> <span class="mono text-sm font-bold text-navy">${formatNaira(tx.amount)}</span> </td> <td class="px-6 py-4 text-center">${statusBadge(tx.status)}</td> </tr>`;
}).join('');

renderPageNumbers(totalPages, page);
document.getElementById('prevBtn').disabled = page === 1;
document.getElementById('nextBtn').disabled = page === totalPages;
}

function renderPageNumbers(total, current) {
const container = document.getElementById('pageNumbers');
if (total <= 1) { container.innerHTML = ''; return; }
const pages = [];
for (let i = 1; i <= Math.min(total, 5); i++) pages.push(i);
container.innerHTML = pages.map(p => `<button onclick="goToPage(${p})" class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${p === current ? 'bg-navy text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}"> ${p} </button>`).join('');
}

function goToPage(page) {
currentPage = page;
renderTable(filtered, currentPage);
}

// Stats
function updateStats(data) {
const paid = data.filter(t => ['paid', 'success'].includes((t.status || '').toLowerCase()));
const total = paid.reduce((sum, t) => sum + Number(t.amount), 0);
const rate = data.length ? Math.round((paid.length / data.length) * 100) : 0;

document.getElementById('statTotal').textContent = `₦${formatNaira(total)}`;
document.getElementById('statCount').textContent = data.length;
document.getElementById('statRate').textContent = `${rate}%`;
document.getElementById('statRateBar').style.width = `${rate}%`;
}

// Apply filters
function applyFilters() {
const status = document.getElementById('filterStatus').value.toLowerCase();
const from = document.getElementById('filterFrom').value;
const to = document.getElementById('filterTo').value;
const search = document.getElementById('headerSearch').value.toLowerCase();

filtered = allTransactions.filter(tx => {
const txStatus = (tx.status || '').toLowerCase();
const txDate = new Date(tx.created_at || tx.timestamp);
const matchStatus = !status || txStatus === status || (status === 'paid' && txStatus === 'success');
const matchFrom = !from || txDate >= new Date(from);
const matchTo = !to || txDate <= new Date(to + 'T23:59:59');
const matchSearch = !search ||
(tx.sender_name || '').toLowerCase().includes(search) ||
(tx.reference || '').toLowerCase().includes(search);
return matchStatus && matchFrom && matchTo && matchSearch;
});

currentPage = 1;
renderTable(filtered, currentPage);
}

// Export CSV
function exportCSV() {
if (!filtered.length) return;
const headers = ['Date', 'Reference', 'Sender', 'Amount', 'Status'];
const rows = filtered.map(tx => {
const d = new Date(tx.created_at || tx.timestamp).toLocaleDateString('en-NG');
return [d, tx.reference || tx.id || '', tx.sender_name || '', tx.amount, tx.status].join(',');
});
const csv = [headers.join(','), ...rows].join('\n');
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `nombaflow-transactions-${Date.now()}.csv`;
a.click();
URL.revokeObjectURL(url);
}

// Load data
async function loadTransactions() {
try {
const headers = { 'Authorization': `Bearer ${token}` };

// Load merchant name
const mRes = await fetch(`${API_BASE}/merchant/me`, { headers });
if (mRes.status === 401) { localStorage.removeItem('token'); window.location.href = 'login.html'; return; }
const merchant = await mRes.json();
const name = merchant.business_name || merchant.owner_name || 'Merchant';
const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
document.getElementById('sidebarName').textContent = name;
document.getElementById('sidebarAvatar').textContent = initials;
document.getElementById('headerAvatar').textContent = initials;
document.getElementById('headerName').textContent = name;

// Load transactions
const txRes = await fetch(`${API_BASE}/transactions`, { headers });
const txData = await txRes.json();
allTransactions = txData.transactions || txData || [];
filtered = [...allTransactions];

updateStats(allTransactions);
renderTable(filtered, currentPage);

} catch (err) {
console.error('Transactions load error:', err);
}
}

// Events
document.getElementById('applyFilter').addEventListener('click', applyFilters);
document.getElementById('clearFilter').addEventListener('click', () => {
document.getElementById('filterStatus').value = '';
document.getElementById('filterFrom').value = '';
document.getElementById('filterTo').value = '';
document.getElementById('headerSearch').value = '';
filtered = [...allTransactions];
currentPage = 1;
renderTable(filtered, currentPage);
});
document.getElementById('headerSearch').addEventListener('input', applyFilters);
document.getElementById('prevBtn').addEventListener('click', () => { if (currentPage > 1) goToPage(currentPage - 1); });
document.getElementById('nextBtn').addEventListener('click', () => {
const total = Math.ceil(filtered.length / PER_PAGE);
if (currentPage < total) goToPage(currentPage + 1);
});
document.getElementById('exportBtn').addEventListener('click', exportCSV);
document.getElementById('logoutBtn').addEventListener('click', () => {
localStorage.removeItem('token');
window.location.href = 'login.html';
});

loadTransactions();