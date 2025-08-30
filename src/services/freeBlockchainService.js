import { ethers } from 'ethers';
import { supabase } from '../lib/supabaseClient';

/**
 * Free Blockchain Service
 * Uses completely FREE testnets that don't require buying ETH
 * All transactions are REAL and visible on block explorers!
 */
class FreeBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.networks = {
      // 1. Mumbai (Polygon Testnet) - FREE transactions
      mumbai: {
        name: 'Mumbai (Polygon)',
        chainId: 80001,
        rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
        explorer: 'https://mumbai.polygonscan.com',
        faucetUrl: 'https://mumbaifaucet.com/',
        currency: 'MATIC',
        gasPrice: '0', // Often free or very cheap
        description: 'Polygon Mumbai testnet - completely FREE transactions!'
      },
      
      // 2. BSC Testnet - FREE transactions
      bscTestnet: {
        name: 'BSC Testnet',
        chainId: 97,
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        explorer: 'https://testnet.bscscan.com',
        faucetUrl: 'https://testnet.binance.org/faucet-smart',
        currency: 'tBNB',
        gasPrice: '0',
        description: 'Binance Smart Chain testnet - FREE transactions!'
      },
      
      // 3. Avalanche Fuji - FREE transactions
      fuji: {
        name: 'Avalanche Fuji',
        chainId: 43113,
        rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
        explorer: 'https://testnet.snowtrace.io',
        faucetUrl: 'https://faucet.avax.network/',
        currency: 'AVAX',
        gasPrice: '0',
        description: 'Avalanche Fuji testnet - FREE transactions!'
      }
    };
    
    this.currentNetwork = 'mumbai'; // Default to Mumbai (most reliable free option)
  }

  /**
   * Auto-request free tokens from faucet
   */
  async requestFreeTokens(network = this.currentNetwork) {
    const networkConfig = this.networks[network];
    
    console.log(`🎁 Requesting free ${networkConfig.currency} tokens...`);
    console.log(`💡 If needed, visit: ${networkConfig.faucetUrl}`);
    
    // For demonstration, we'll use a public faucet API where available
    try {
      // Mumbai/Polygon has a public API
      if (network === 'mumbai' && this.signer) {
        const address = await this.signer.getAddress();
        
        // Try public faucet API (this is a real working faucet)
        const response = await fetch('https://faucet.polygon.technology/api/v1/faucet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            network: 'mumbai',
            address: address,
            token: 'maticToken'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Free tokens requested successfully!');
          return true;
        }
      }
      
      // For other networks, guide user to manual faucet
      console.log(`💡 Please visit ${networkConfig.faucetUrl} to get free ${networkConfig.currency}`);
      return false;
      
    } catch (error) {
      console.log(`💡 Auto-faucet not available. Please visit: ${networkConfig.faucetUrl}`);
      return false;
    }
  }

  /**
   * Initialize connection to free blockchain
   */
  async initialize(networkName = this.currentNetwork) {
    try {
      const network = this.networks[networkName];
      if (!network) {
        throw new Error(`Unknown network: ${networkName}`);
      }

      console.log(`🔗 Connecting to ${network.name}...`);

      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await this.provider.send("eth_requestAccounts", []);
        
        // Check if we're on the correct network
        const currentNetwork = await this.provider.getNetwork();
        
        if (Number(currentNetwork.chainId) !== network.chainId) {
          // Try to switch network
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            });
          } catch (switchError) {
            // Network not added, try to add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${network.chainId.toString(16)}`,
                  chainName: network.name,
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.explorer],
                  nativeCurrency: {
                    name: network.currency,
                    symbol: network.currency,
                    decimals: 18
                  }
                }],
              });
            }
          }
        }
        
        this.signer = await this.provider.getSigner();
        this.currentNetwork = networkName;
        
        console.log('✅ Connected to', network.name);
        console.log('📍 Wallet address:', await this.signer.getAddress());
        
        // Check balance
        const balance = await this.provider.getBalance(await this.signer.getAddress());
        const balanceFormatted = ethers.formatEther(balance);
        console.log(`💰 Balance: ${balanceFormatted} ${network.currency}`);
        
        // If balance is low, try to get free tokens
        if (parseFloat(balanceFormatted) < 0.01) {
          console.log('💡 Low balance detected, requesting free tokens...');
          await this.requestFreeTokens(networkName);
        }
        
        return true;
      } else {
        throw new Error('MetaMask not detected');
      }
    } catch (error) {
      console.error('❌ Failed to initialize blockchain connection:', error);
      throw error;
    }
  }

  /**
   * Issue credits on FREE blockchain
   * Creates REAL transactions with ZERO cost!
   */
  async issueCredits(volume, description) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check user role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRole || userRole.role !== 'producer') {
        throw new Error('Only producers can issue credits');
      }

      // Initialize blockchain if needed
      if (!this.signer) {
        await this.initialize();
      }

      const network = this.networks[this.currentNetwork];
      console.log(`🔗 Creating REAL transaction on ${network.name}...`);
      console.log(`💰 Cost: FREE (${network.currency} testnet)`);

      // Create metadata for the transaction
      const metadata = JSON.stringify({
        type: 'GREEN_HYDROGEN_CREDIT',
        volume: volume,
        description: description,
        producer: user.email,
        issuedAt: new Date().toISOString(),
        network: network.name
      });

      // Encode metadata as transaction data
      const transactionData = ethers.hexlify(ethers.toUtf8Bytes(metadata));
      
      // Get wallet address
      const walletAddress = await this.signer.getAddress();

      // Send FREE transaction
      const tx = await this.signer.sendTransaction({
        to: walletAddress, // Send to self to store data
        value: 0, // No value transfer
        data: transactionData,
        gasLimit: 100000,
        gasPrice: ethers.parseUnits('1', 'gwei') // Minimal gas price
      });

      console.log('📤 FREE transaction sent:', tx.hash);
      console.log(`🌐 View on ${network.name} explorer:`, `${network.explorer}/tx/${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log('✅ FREE transaction confirmed!');
      console.log('🔗 Block number:', receipt.blockNumber);
      console.log('💸 Gas used:', receipt.gasUsed.toString());

      // Store in database
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .insert({
          user_id: user.id,
          token_id: `GHC_${network.name}_${receipt.blockNumber}_${receipt.transactionIndex}`,
          volume: parseFloat(volume),
          status: 'issued',
          blockchain_tx_hash: tx.hash,
          metadata: {
            description: description || 'Green Hydrogen Credit',
            issuedAt: new Date().toISOString(),
            producer: user.email,
            network: network.name,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            explorerUrl: `${network.explorer}/tx/${tx.hash}`,
            isRealBlockchain: true,
            isFree: true // Flag for free blockchain
          }
        })
        .select()
        .single();

      if (creditError) {
        throw new Error('Failed to store credit in database');
      }

      // Log transaction
      await supabase.from('transactions').insert({
        credit_id: credit.id,
        from_user: null,
        to_user: user.id,
        type: 'issue',
        volume: parseFloat(volume),
        tx_hash: tx.hash
      });

      return {
        success: true,
        credit: credit,
        blockchain: {
          tokenId: credit.token_id,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          explorerUrl: `${network.explorer}/tx/${tx.hash}`,
          network: network.name
        },
        message: `Credit issued successfully on ${network.name} (FREE!)`,
        tx_hash: tx.hash,
        token_id: credit.token_id,
        isRealBlockchain: true,
        isFree: true,
        explorerUrl: `${network.explorer}/tx/${tx.hash}`
      };

    } catch (error) {
      console.error('❌ Free blockchain transaction failed:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        const network = this.networks[this.currentNetwork];
        throw new Error(`Need free ${network.currency} tokens. Visit: ${network.faucetUrl}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get available free networks
   */
  getAvailableNetworks() {
    return Object.entries(this.networks).map(([key, network]) => ({
      key,
      name: network.name,
      currency: network.currency,
      description: network.description,
      faucetUrl: network.faucetUrl
    }));
  }

  /**
   * Switch to a different free network
   */
  async switchNetwork(networkName) {
    if (!this.networks[networkName]) {
      throw new Error(`Unknown network: ${networkName}`);
    }
    
    await this.initialize(networkName);
    return this.networks[networkName];
  }
}

export default new FreeBlockchainService();
