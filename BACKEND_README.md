# 🐺 BlackWolf - Complete Forex Trading Platform

A full-stack professional forex trading platform with real-time exchange rates, user authentication, trading engine, and payment processing.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Technologies](#technologies)

---

## ✨ Features

### Frontend
- ✅ **Live Exchange Rates** - Real-time forex rates with auto-updates
- ✅ **Currency Converter** - Convert between 8 major currencies
- ✅ **Responsive Design** - Mobile, tablet, and desktop support
- ✅ **Modern UI** - Dark theme with cyan/blue gradients
- ✅ **Smooth Animations** - Professional fade-in effects

### Backend
- ✅ **User Authentication** - Secure JWT-based login/register
- ✅ **Two-Factor Authentication (2FA)** - Speakeasy TOTP support
- ✅ **Trading Engine** - Open/close trades with P&L calculation
- ✅ **Payment Processing** - Stripe integration for deposits
- ✅ **Real-time Rates API** - Fetch live forex data
- ✅ **WebSocket Support** - Real-time price updates via Socket.io
- ✅ **Transaction History** - Complete trade and payment tracking
- ✅ **User Profiles** - Manage account settings and preferences

---

## 📁 Project Structure

```
blackwolf-forex/
├── frontend/
│   ├── index.html          # Main HTML
│   ├── styles.css          # Styling
│   └── script.js           # Frontend JavaScript
│
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   │
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── trades.js       # Trading routes
│   │   ├── rates.js        # Exchange rates API
│   │   ├── users.js        # User profile routes
│   │   └── payments.js     # Payment routes
│   │
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Trade.js        # Trade schema
│   │   └── Transaction.js  # Transaction schema
│   │
│   └── config/
│       └── database.js     # MongoDB config
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Stripe Account (for payments)
- Open Exchange Rates API Key (optional)

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/onlyblackwolf8-creator/forex.git
cd forex
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your keys
```

4. **Start MongoDB:**
```bash
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas
# Update MONGODB_URI in .env
```

5. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:5000`

### Frontend Setup

The frontend files are already in the root directory:
- `index.html`
- `styles.css`
- `script.js`

To run locally:
```bash
# Python 3
python -m http.server 8000

# Visit: http://localhost:8000
```

---

## ⚙️ Configuration

### Essential Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/blackwolf

# JWT Secret
JWT_SECRET=your_super_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here

# API Keys
OPEN_EXCHANGE_RATES_KEY=your_api_key_here

# Frontend
CLIENT_URL=http://localhost:3000
```

### Getting API Keys

1. **Stripe:**
   - Sign up at https://stripe.com
   - Get keys from Dashboard → Developers → API Keys

2. **Open Exchange Rates:**
   - Sign up at https://openexchangerates.org
   - Free tier: 1000 requests/month

3. **MongoDB:**
   - Local: `mongodb://localhost:27017/blackwolf`
   - Atlas: https://www.mongodb.com/cloud/atlas

---

## 📡 API Documentation

### Authentication

**Register User:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "blackwolf_trader",
  "email": "trader@blackwolf.com",
  "password": "SecurePass123",
  "firstName": "Black",
  "lastName": "Wolf"
}
```

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "trader@blackwolf.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Trading

**Create Trade:**
```bash
POST /api/trades
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "pair": "EUR/USD",
  "type": "buy",
  "entryPrice": 1.0920,
  "quantity": 1,
  "stopLoss": 1.0800,
  "takeProfit": 1.1050,
  "leverage": 1
}
```

**Get User Trades:**
```bash
GET /api/trades
Authorization: Bearer YOUR_TOKEN
```

**Close Trade:**
```bash
PUT /api/trades/:id/close
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "exitPrice": 1.0950
}
```

### Exchange Rates

**Get All Rates:**
```bash
GET /api/rates/all
```

**Convert Currency:**
```bash
POST /api/rates/convert
Content-Type: application/json

{
  "from": "USD",
  "to": "EUR",
  "amount": 1000
}
```

### Payments

**Create Deposit:**
```bash
POST /api/payments/deposit
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "amount": 500,
  "currency": "usd"
}
```

**Get Balance:**
```bash
GET /api/payments/balance
Authorization: Bearer YOUR_TOKEN
```

---

## 🌐 Real-time Updates (WebSocket)

Connect to real-time forex rates:

```javascript
const socket = io('http://localhost:5000');

// Subscribe to rates
socket.emit('subscribe_rates', ['USD/EUR', 'GBP/USD']);

// Listen for updates
socket.on('rates_update', (rates) => {
  console.log('Updated rates:', rates);
});
```

---

## 🚢 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create blackwolf-forex

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set STRIPE_SECRET_KEY=your_stripe_key

# Deploy
git push heroku main
```

### Deploy Frontend to GitHub Pages

```bash
# Update package.json with homepage
"homepage": "https://onlyblackwolf8-creator.github.io/forex"

# Deploy
npm run build
npm run deploy
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t blackwolf .
docker run -p 5000:5000 blackwolf
```

---

## 🛠 Technologies

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive Grid & Flexbox
- Socket.io Client

### Backend
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, Speakeasy 2FA
- **Payment:** Stripe
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, bcryptjs
- **Validation:** Express Validator

### DevOps
- Node.js
- MongoDB Atlas / Local MongoDB
- Stripe Webhooks
- Redis (optional caching)

---

## 📊 Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  accountBalance: Number,
  accountStatus: String,
  kycVerified: Boolean,
  twoFactorEnabled: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

### Trade Model
```javascript
{
  userId: ObjectId,
  pair: String,
  type: "buy" | "sell",
  entryPrice: Number,
  exitPrice: Number,
  quantity: Number,
  status: "open" | "closed",
  profitLoss: Number,
  leverage: Number,
  openedAt: Date,
  closedAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  type: "deposit" | "withdrawal" | "trade",
  amount: Number,
  status: "pending" | "completed",
  paymentMethod: String,
  createdAt: Date
}
```

---

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ 2FA with TOTP
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Mongoose)
- ✅ Rate limiting
- ✅ HTTPS in production

---

## 📞 Support & Contact

- **GitHub:** https://github.com/onlyblackwolf8-creator/forex
- **Issues:** Report bugs on GitHub Issues
- **Email:** onlyblackwolf8@gmail.com

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial use.

---

## 🚀 Next Steps

1. ✅ Set up MongoDB Atlas account
2. ✅ Create Stripe account and get API keys
3. ✅ Configure `.env` file
4. ✅ Run `npm install`
5. ✅ Start backend with `npm run dev`
6. ✅ Deploy frontend to GitHub Pages
7. ✅ Start trading! 🐺

---

**BlackWolf Trading Platform - Trade Like a Wolf! 🐺💰**
