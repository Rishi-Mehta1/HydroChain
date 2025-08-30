import { ethers } from 'ethers';
import { supabase } from '../lib/supabaseClient';

// Contract ABIs (simplified - in production, import from contract artifacts)
const CREDITS_CONTRACT_ABI = [
  // ERC-1155 standard functions
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  
  // Custom functions for Green Hydrogen Credits
  "function registerFacility(string name, string location, uint256 capacityMW, uint8[] renewableSources) returns (uint256)",
  "function certifyFacility(uint256 facilityId)",
  "function issueCredits(uint256 volume, uint8 productionMethod, uint8 renewableSource, uint256 facilityId, uint256 expiryDate, string metadataURI) returns (uint256)",
  "function verifyCredits(uint256 tokenId)",
  "function retireCredits(uint256 tokenId, uint256 volume, string retirementReason, string complianceProject, string beneficiary)",
  "function getCreditInfo(uint256 tokenId) view returns (tuple(uint256,address,uint256,uint8,uint8,uint256,uint8,address,uint256,uint256,string,bool))",
  "function getFacilityInfo(uint256 facilityId) view returns (tuple(uint256,address,string,string,uint256,uint8[],bool,address,uint256,bool))",
  "function getTransferableBalance(address account, uint256 tokenId) view returns (uint256)",
  
  // Events
  "event CreditIssued(uint256 indexed tokenId, address indexed producer, uint256 volume, uint256 facilityId)",
  "event CreditVerified(uint256 indexed tokenId, address indexed verifier, uint256 verificationDate)",
  "event CreditTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 volume)",
  "event CreditRetired(uint256 indexed tokenId, address indexed retiredBy, uint256 volume, string certificateId)"
];

const MARKETPLACE_CONTRACT_ABI = [
  "function createOrder(uint8 orderType, uint256 tokenId, uint256 volume, uint256 pricePerUnit, uint256 expiresAt, bool partialFillAllowed) returns (uint256)",
  "function fillOrder(uint256 orderId, uint256 volume)",
  "function cancelOrder(uint256 orderId)",
  "function createAuction(uint256 tokenId, uint256 volume, uint256 reservePrice, uint256 duration) returns (uint256)",
  "function placeBid(uint256 auctionId, uint256 bidAmount)",
  "function finalizeAuction(uint256 auctionId)",
  "function getOrder(uint256 orderId) view returns (tuple(uint256,address,uint8,uint256,uint256,uint256,uint256,uint8,uint256,uint256,bool))",
  "function getUserOrders(address user) view returns (uint256[])",
  
  // Events
  "event OrderCreated(uint256 indexed orderId, address indexed trader, uint8 orderType, uint256 indexed tokenId, uint256 volume, uint256 pricePerUnit)",
  "event OrderFilled(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 volume, uint256 totalPrice)"
];

// Network configurations
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/', // Add your Infura project ID
    chainId: 11155111,
    creditsContractAddress: process.env.REACT_APP_CREDITS_CONTRACT_ADDRESS,
    marketplaceContractAddress: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS
  },
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/',
    chainId: 137,
    creditsContractAddress: process.env.REACT_APP_POLYGON_CREDITS_CONTRACT_ADDRESS,
    marketplaceContractAddress: process.env.REACT_APP_POLYGON_MARKETPLACE_CONTRACT_ADDRESS
  }
};

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.creditsContract = null;
    this.marketplaceContract = null;
    this.network = process.env.REACT_APP_BLOCKCHAIN_NETWORK || 'sepolia';
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        await this.setupContracts();
        return true;
      } else {
        console.warn('No Web3 wallet found');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }

  /**
   * Setup contract instances
   */
  async setupContracts() {
    const networkConfig = NETWORKS[this.network];
    
    if (networkConfig.creditsContractAddress) {
      this.creditsContract = new ethers.Contract(
        networkConfig.creditsContractAddress,
        CREDITS_CONTRACT_ABI,
        this.signer
      );
    }

    if (networkConfig.marketplaceContractAddress) {
      this.marketplaceContract = new ethers.Contract(
        networkConfig.marketplaceContractAddress,
        MARKETPLACE_CONTRACT_ABI,
        this.signer
      );
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet found');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.initialize();
      
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  /**
   * Register a production facility
   */
  async registerFacility(facilityData) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const { name, location, capacityMW, renewableSources } = facilityData;
      
      const tx = await this.creditsContract.registerFacility(
        name,
        location,
        ethers.parseUnits(capacityMW.toString(), 2), // 2 decimals for MW
        renewableSources.map(source => this.mapRenewableSource(source))
      );

      const receipt = await tx.wait();
      const facilityId = this.extractFacilityIdFromReceipt(receipt);

      return {
        success: true,
        facilityId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to register facility:', error);
      throw error;
    }
  }

  /**
   * Issue green hydrogen credits
   */
  async issueCredits(creditData) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const { 
        volume, 
        productionMethod, 
        renewableSource, 
        facilityId, 
        expiryDate, 
        metadataURI 
      } = creditData;

      const tx = await this.creditsContract.issueCredits(
        ethers.parseUnits(volume.toString(), 6), // 6 decimals for kg
        this.mapProductionMethod(productionMethod),
        this.mapRenewableSource(renewableSource),
        facilityId,
        Math.floor(expiryDate / 1000), // Convert to Unix timestamp
        metadataURI || ''
      );

      const receipt = await tx.wait();
      const tokenId = this.extractTokenIdFromReceipt(receipt);

      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to issue credits:', error);
      throw error;
    }
  }

  /**
   * Transfer credits
   */
  async transferCredits(transferData) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const { tokenId, toAddress, volume } = transferData;
      const fromAddress = await this.getWalletAddress();

      const tx = await this.creditsContract.safeTransferFrom(
        fromAddress,
        toAddress,
        tokenId,
        ethers.parseUnits(volume.toString(), 6),
        '0x'
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to transfer credits:', error);
      throw error;
    }
  }

  /**
   * Retire credits
   */
  async retireCredits(retirementData) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const { 
        tokenId, 
        volume, 
        retirementReason, 
        complianceProject, 
        beneficiary 
      } = retirementData;

      const tx = await this.creditsContract.retireCredits(
        tokenId,
        ethers.parseUnits(volume.toString(), 6),
        retirementReason,
        complianceProject || '',
        beneficiary || ''
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        certificateId: this.extractCertificateIdFromReceipt(receipt)
      };
    } catch (error) {
      console.error('Failed to retire credits:', error);
      throw error;
    }
  }

  /**
   * Get credit information
   */
  async getCreditInfo(tokenId) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const creditInfo = await this.creditsContract.getCreditInfo(tokenId);
      
      return {
        tokenId: creditInfo[0].toString(),
        producer: creditInfo[1],
        volume: ethers.formatUnits(creditInfo[2], 6),
        productionMethod: this.unmapProductionMethod(creditInfo[3]),
        renewableSource: this.unmapRenewableSource(creditInfo[4]),
        facilityId: creditInfo[5].toString(),
        status: this.unmapCreditStatus(creditInfo[6]),
        verifier: creditInfo[7],
        verificationDate: creditInfo[8].toString(),
        expiryDate: creditInfo[9].toString(),
        metadataURI: creditInfo[10],
        exists: creditInfo[11]
      };
    } catch (error) {
      console.error('Failed to get credit info:', error);
      throw error;
    }
  }

  /**
   * Get user's credit balance
   */
  async getCreditBalance(userAddress, tokenId) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const balance = await this.creditsContract.balanceOf(userAddress, tokenId);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Failed to get credit balance:', error);
      throw error;
    }
  }

  /**
   * Get transferable balance
   */
  async getTransferableBalance(userAddress, tokenId) {
    if (!this.creditsContract) {
      throw new Error('Credits contract not available');
    }

    try {
      const balance = await this.creditsContract.getTransferableBalance(userAddress, tokenId);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Failed to get transferable balance:', error);
      throw error;
    }
  }

  /**
   * Create marketplace order
   */
  async createOrder(orderData) {
    if (!this.marketplaceContract) {
      throw new Error('Marketplace contract not available');
    }

    try {
      const { 
        orderType, 
        tokenId, 
        volume, 
        pricePerUnit, 
        expiresAt, 
        partialFillAllowed 
      } = orderData;

      const tx = await this.marketplaceContract.createOrder(
        orderType === 'buy' ? 0 : 1,
        tokenId,
        ethers.parseUnits(volume.toString(), 6),
        ethers.parseUnits(pricePerUnit.toString(), 6),
        Math.floor(expiresAt / 1000),
        partialFillAllowed
      );

      const receipt = await tx.wait();
      const orderId = this.extractOrderIdFromReceipt(receipt);

      return {
        success: true,
        orderId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  // Utility methods for mapping enums
  mapProductionMethod(method) {
    const mapping = {
      'electrolysis': 0,
      'biogas_reforming': 1,
      'thermochemical': 2
    };
    return mapping[method] ?? 0;
  }

  mapRenewableSource(source) {
    const mapping = {
      'solar': 0,
      'wind': 1,
      'hydro': 2,
      'geothermal': 3,
      'biomass': 4,
      'mixed': 5
    };
    return mapping[source] ?? 0;
  }

  unmapProductionMethod(method) {
    const mapping = ['electrolysis', 'biogas_reforming', 'thermochemical'];
    return mapping[method] ?? 'unknown';
  }

  unmapRenewableSource(source) {
    const mapping = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'mixed'];
    return mapping[source] ?? 'unknown';
  }

  unmapCreditStatus(status) {
    const mapping = ['pending', 'verified', 'issued', 'transferred', 'retired'];
    return mapping[status] ?? 'unknown';
  }

  // Helper methods to extract data from transaction receipts
  extractTokenIdFromReceipt(receipt) {
    // Extract tokenId from CreditIssued event
    for (const log of receipt.logs) {
      try {
        const parsed = this.creditsContract.interface.parseLog(log);
        if (parsed.name === 'CreditIssued') {
          return parsed.args[0].toString();
        }
      } catch (e) {
        // Ignore parsing errors for other logs
      }
    }
    return null;
  }

  extractFacilityIdFromReceipt(receipt) {
    // Similar implementation for facility registration
    return 1; // Mock implementation
  }

  extractOrderIdFromReceipt(receipt) {
    // Similar implementation for order creation
    return 1; // Mock implementation
  }

  extractCertificateIdFromReceipt(receipt) {
    // Extract certificate ID from CreditRetired event
    return `RC_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export default new BlockchainService();
