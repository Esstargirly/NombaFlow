# NombaFlow 

**NombaFlow** gives every small Nigerian business their own dedicated payment account number and automatically records every payment that comes in — built on Nomba's API for the Nomba x DevCareer Hackathon 2026.


## 🔗 Live Demo
**https://nombaflow.onrender.com**


##  The Problem
Small business owners in Nigeria share their personal bank account with customers to receive payments. This means business and personal money mix together, payments are tracked manually on WhatsApp or paper, and there is no clear record of who paid what and when.

##  The Solution
NombaFlow gives each business a permanent dedicated virtual account number through Nomba's API. When a customer sends money to that account, NombaFlow automatically records the payment — who sent it, how much, and when — and displays it on a simple dashboard. No manual entry. No shared accounts. No confusion.


##  Features
- Business registration with automatic virtual account creation via Nomba API
- JWT authentication (register, login, protected routes)
- Real-time payment tracking via Nomba webhooks
- HMAC-SHA256 webhook signature verification
- Full transaction history with filtering and CSV export
- Account details page with copy and share account number
- Settings page for profile and password management
- Fully responsive frontend

## How It Works

**1. Business Registration**
A merchant signs up with their business name, owner name, email and password. The moment they register, NombaFlow automatically calls Nomba's API and creates a dedicated virtual account number tied to that business. This happens instantly in the background — the merchant never has to do anything manually.

**2. Getting Paid**
The merchant shares their dedicated account number with customers. Customers send money to that account via any Nigerian bank app — just like a normal bank transfer.

**3. Automatic Payment Recording**
The moment a payment lands on the virtual account, Nomba sends a webhook event to NombaFlow. The webhook handler verifies the signature using HMAC-SHA256, identifies which merchant received the payment via the account reference, and records the transaction automatically — sender name, amount, timestamp, and status.

**4. Dashboard**
The merchant logs into their NombaFlow dashboard and sees every payment recorded in real time. No manual entry. No WhatsApp screenshots. No Excel sheets. Just a clean, accurate payment history always up to date.

## 💡 Benefits

**For the business owner**
- One permanent account number for life — no more sharing personal accounts with customers
- Every payment automatically recorded with sender name, amount, and timestamp
- Clean payment history they can actually use for bookkeeping and reconciliation
- Peace of mind — they always know who paid, how much, and when
- Professional payment identity that separates business from personal finances

**For the Nigerian fintech ecosystem**
- Fills a real infrastructure gap — persistent dedicated accounts for the informal and micro-business sector
- Proves Nomba's API can power serious business infrastructure beyond one-off transactions
- Lays the foundation for more advanced features like invoicing, payment links, and split payments
- Brings financial clarity to millions of Nigerian small businesses currently operating informally

**For developers building on Nomba**
- Demonstrates a complete end-to-end integration of Nomba's virtual account and webhook APIs
- Shows how to build persistent, merchant-specific financial infrastructure on top of Nomba's platform
- Serves as a reference implementation for webhook signature verification and real-time payment tracking


## Tech Stack
| Layer | Tool |
|---|---|
| Frontend | HTML, Tailwind CSS, Vanilla JavaScript |
| Backend | Python, Flask |
| Database | PostgreSQL on Neon |
| Auth | JWT via Flask-JWT-Extended |
| Payments | Nomba Virtual Account API |
| Webhooks | Nomba Webhook Events |
| Deployment | Render |


## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register business + create virtual account |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/merchant/me` | Get merchant and virtual account details |
| GET | `/api/transactions` | Get all transactions |
| POST | `/webhook/nomba` | Receive Nomba payment webhook events |
