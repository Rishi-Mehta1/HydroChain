# HydroChain Backend Setup Guide

This guide will walk you through setting up the complete backend infrastructure for your Green Hydrogen Credit System.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git
- A crypto wallet (MetaMask recommended) with some Sepolia ETH for testing

## 1. Environment Variables Setup

You'll need to obtain several API keys and configure your environment. Here's where to get each one:

### 1.1 Supabase Configuration

Your Supabase project is already configured. You can find additional keys in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kotakdgdunayyvdrhboq`
3. Go to Settings → API
4. Copy the `service_role` key and add it to your `.env` file

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 1.2 Blockchain Infrastructure (Infura)

1. Go to [Infura.io](https://infura.io)
2. Create a free account
3. Create a new project
4. Select "Web3 API" 
5. Copy your Project ID
6. Add to `.env`:

```env
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id_here
```

### 1.3 Private Keys (IMPORTANT: Keep Secret!)

You'll need a private key for contract deployment:

1. Open MetaMask
2. Click on your account name → Account Details → Export Private Key
3. Enter your password and copy the private key
4. Add to `.env` (NEVER commit this file!):

```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
CONTRACT_OWNER_PRIVATE_KEY=your_private_key_here
```

### 1.4 External Services (Optional)

#### OpenAI API (for AI features)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account and get API key
3. Add to `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

#### SendGrid (for email notifications)
1. Go to [SendGrid](https://sendgrid.com)
2. Create account and get API key
3. Add to `.env`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

## 2. Database Setup

Run the enhanced schema migration:

```bash
# Navigate to your project directory
cd C:\Users\mehta\Desktop\finalProject\HydroChain

# Install dependencies (if not already done)
npm install

# Run the migration script (you'll need to run this in Supabase SQL Editor)
```

### 2.1 Manual Database Setup

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy and paste the content from `supabase/migrations/003_enhanced_schema.sql`
4. Click "RUN" to execute the migration

This will create all the necessary tables for:
- Production facilities
- Credit management
- IoT data
- Verification requests
- Audit trails
- Market orders

## 3. Smart Contract Deployment

### 3.1 Get Test ETH

1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request test ETH (you'll need ~0.1 ETH for deployment)

### 3.2 Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

This will:
- Deploy the GreenHydrogenCredits contract
- Deploy the HydrogenCreditsMarketplace contract
- Deploy a mock USDC token for testing
- Update your `.env` file with contract addresses
- Set up initial roles

## 4. Supabase Edge Functions Setup

### 4.1 Install Supabase CLI

```bash
npm install -g @supabase/cli
```

### 4.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase projects list
supabase link --project-ref kotakdgdunayyvdrhboq
```

### 4.3 Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy --project-ref kotakdgdunayyvdrhboq

# Or deploy individual functions
supabase functions deploy issue-credit --project-ref kotakdgdunayyvdrhboq
supabase functions deploy transfer-credit --project-ref kotakdgdunayyvdrhboq
supabase functions deploy retire-credit --project-ref kotakdgdunayyvdrhboq
supabase functions deploy verify-production --project-ref kotakdgdunayyvdrhboq
```

## 5. Testing the Setup

### 5.1 Start the Development Server

```bash
npm start
```

### 5.2 Test Basic Functionality

1. **Authentication**: Try signing up with different roles (producer, buyer, auditor)
2. **Facility Registration**: As a producer, register a new facility
3. **Credit Issuance**: Issue some test credits
4. **Credit Transfer**: Transfer credits between users

### 5.3 Blockchain Testing

```bash
# Test contract deployment
npx hardhat test

# Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 6. Production Considerations

### 6.1 Security
- Never commit private keys to version control
- Use environment-specific `.env` files
- Enable Row Level Security (RLS) in Supabase
- Implement proper access controls

### 6.2 Scalability
- Consider using Polygon for lower gas costs
- Implement caching strategies
- Use CDN for static assets
- Monitor database performance

### 6.3 Monitoring
- Set up error tracking (Sentry)
- Monitor blockchain transactions
- Track API usage and performance
- Set up alerts for critical failures

## 7. API Endpoints

Your edge functions will be available at:
- `https://kotakdgdunayyvdrhboq.supabase.co/functions/v1/issue-credit`
- `https://kotakdgdunayyvdrhboq.supabase.co/functions/v1/transfer-credit`
- `https://kotakdgdunayyvdrhboq.supabase.co/functions/v1/retire-credit`
- `https://kotakdgdunayyvdrhboq.supabase.co/functions/v1/verify-production`

## 8. Troubleshooting

### Common Issues

1. **"Network not found" error**: Check your Infura project ID
2. **"Insufficient funds" error**: Ensure your wallet has enough Sepolia ETH
3. **Database connection error**: Verify your Supabase URL and keys
4. **Edge function timeout**: Check function logs in Supabase dashboard

### Getting Help

- Check the console for error messages
- Review Supabase logs in the dashboard
- Verify blockchain transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/)

## Next Steps

1. **Frontend Integration**: Connect your React app to the deployed contracts
2. **User Testing**: Invite test users to try different roles
3. **Data Population**: Add sample facilities and credits
4. **Performance Optimization**: Monitor and optimize database queries
5. **Security Audit**: Review smart contracts and access controls

## Support

If you encounter any issues during setup:
1. Check the error logs in Supabase dashboard
2. Verify all environment variables are set correctly
3. Ensure you have sufficient test ETH in your wallet
4. Review the contract deployment logs

Your blockchain-based Green Hydrogen Credit System is now ready for testing and development!
