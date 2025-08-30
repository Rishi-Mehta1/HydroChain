# 🚀 HydroChain - Hackathon Setup Guide

**Simple blockchain-based Green Hydrogen Credit System - Ready in 10 minutes!**

## 🎯 What You'll Build

A working blockchain system that:
- ✅ Issues green hydrogen credits as NFTs (ERC-721)
- ✅ Transfers credits between users (producers, buyers, auditors)
- ✅ Retires credits to prevent double counting
- ✅ Tracks all transactions transparently
- ✅ Provides role-based access control

## ⚡ Quick Setup (10 minutes)

### Step 1: Get Required API Keys (5 minutes)

#### 1.1 Supabase Service Role Key ⚠️ **REQUIRED**
1. Go to: [Supabase Dashboard](https://supabase.com/dashboard/project/kotakdgdunayyvdrhboq/settings/api)
2. Copy the **service_role** key (not the anon key)
3. Update your `.env` file:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 1.2 Infura Project ID ⚠️ **REQUIRED**
1. Go to: [Infura.io](https://infura.io) (free account)
2. Create new project → Web3 API
3. Copy your Project ID
4. Update your `.env` file:
```env
INFURA_PROJECT_ID=your_infura_project_id_here
```

#### 1.3 MetaMask Private Key ⚠️ **REQUIRED**
1. Open MetaMask → Account Details → Export Private Key
2. **⚠️ Keep this secret!** Add to `.env`:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

#### 1.4 Get Sepolia ETH ⚠️ **REQUIRED**
1. Go to: [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect MetaMask and request 0.1 ETH

### Step 2: Setup Database (2 minutes)

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/kotakdgdunayyvdrhboq/sql)
2. Copy and paste this SQL:

```sql
-- Run the minimal schema migration
-- Copy content from: supabase/migrations/004_minimal_hackathon_schema.sql
-- Paste and click RUN
```

### Step 3: Deploy Smart Contract (2 minutes)

```bash
# Compile and deploy
npm run compile
npm run deploy:sepolia
```

This will deploy a simple ERC-721 contract for your credits.

### Step 4: Generate Test Data (1 minute)

```bash
npm run generate:testdata
```

Creates 3 test users and sample credits.

### Step 5: Test Your App! 🎉

```bash
npm start
```

**Test Login Credentials:**
- **Producer**: `producer@hydrochain.com` | `TestPassword123!`
- **Buyer**: `buyer@hydrochain.com` | `TestPassword123!`  
- **Auditor**: `auditor@hydrochain.com` | `TestPassword123!`

## 📋 Core Features

### **For Producers:**
- Issue new green hydrogen credits
- View their issued credits
- See transaction history

### **For Buyers:**
- View available credits
- Transfer credits to their account
- Retire credits for compliance

### **For Auditors:**
- View all credits and transactions
- Monitor system activity
- Verify credit authenticity

## 🏗️ Simple Architecture

```
React Frontend
     ↓
Supabase (Auth + Database)
     ↓
Edge Functions (Secure blockchain calls)
     ↓
Sepolia Testnet (ERC-721 Credits)
```

## 📊 Database Tables (Minimal)

1. **`user_roles`** - User roles (producer, buyer, auditor)
2. **`credits`** - Credit metadata linked to blockchain tokens
3. **`transactions`** - Transaction logs (issue, transfer, retire)

## 🔧 Smart Contract Functions

- `issueCredit(volume, description)` - Issue new credit
- `transferCredit(to, tokenId)` - Transfer credit
- `retireCredit(tokenId)` - Retire credit
- `getCreditInfo(tokenId)` - Get credit details

## 🚨 Troubleshooting

**"Network not found"** → Check Infura Project ID in `.env`  
**"Insufficient funds"** → Get Sepolia ETH from faucet  
**"Database error"** → Verify Supabase keys  
**"Contract not deployed"** → Run `npm run deploy:sepolia`  

## 🎯 Perfect for Hackathons!

- ✅ **Fast Setup** - Ready in 10 minutes
- ✅ **Real Blockchain** - Working on Sepolia testnet
- ✅ **Demo Ready** - Includes test data and users
- ✅ **Scalable** - Easy to extend with more features
- ✅ **Free Tier** - All services use free plans

## 📈 What Judges Will See

1. **Working Blockchain Integration** - Real smart contracts on testnet
2. **Role-Based System** - Different user types with appropriate access
3. **Transparent Transactions** - All actions recorded immutably
4. **Professional UI** - Clean React dashboard with real data
5. **Security Features** - Proper authentication and access control

## 💡 Demo Script

1. **Login as Producer** → Issue credits for green hydrogen production
2. **Login as Buyer** → View and purchase available credits  
3. **Transfer Credits** → Move credits between accounts
4. **Login as Auditor** → View all transactions and verify authenticity
5. **Retire Credits** → Demonstrate compliance and prevent double counting

**Your blockchain-based Green Hydrogen Credit System is ready to impress! 🌟**
