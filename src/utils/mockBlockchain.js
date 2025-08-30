/**
 * Utility functions for generating mock blockchain data
 * Used when Edge Functions are not available
 */

/**
 * Generate a proper 64-character Ethereum transaction hash
 * @returns {string} A valid-looking Ethereum transaction hash
 */
export const generateMockTxHash = () => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
};

/**
 * Generate mock blockchain data for a transaction
 * @returns {object} Mock blockchain transaction data
 */
export const generateMockBlockchainData = () => {
  return {
    tokenId: `GHC_${Date.now()}`,
    transactionHash: generateMockTxHash(),
    blockNumber: Math.floor(Math.random() * 1000000) + 19000000
  };
};

/**
 * Check if a transaction hash is a mock hash
 * Mock hashes will not exist on the actual blockchain
 * @param {string} txHash - Transaction hash to check
 * @returns {boolean} True if this appears to be mock data
 */
export const isMockTransaction = (txHash) => {
  // All our mock transactions will be random, but we can't definitively 
  // determine if a hash is mock just by looking at it
  // For now, we'll use metadata from the database
  return false; // This would need to be checked against metadata
};

/**
 * Get a safe link for viewing transaction details
 * For mock data, returns null to prevent broken links
 * @param {string} txHash - Transaction hash
 * @param {boolean} isMock - Whether this is mock data
 * @param {string} network - Blockchain network (default: sepolia)
 * @returns {string|null} Etherscan URL or null for mock data
 */
export const getTransactionUrl = (txHash, isMock = false, network = 'sepolia') => {
  if (isMock) {
    return null; // Don't provide links for mock data
  }
  
  const baseUrls = {
    mainnet: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    goerli: 'https://goerli.etherscan.io'
  };
  
  const baseUrl = baseUrls[network] || baseUrls.sepolia;
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Format a transaction hash for display
 * @param {string} txHash - Full transaction hash
 * @param {number} prefixLength - Number of characters to show at start
 * @param {number} suffixLength - Number of characters to show at end
 * @returns {string} Formatted hash like "0x1234...abcd"
 */
export const formatTxHash = (txHash, prefixLength = 6, suffixLength = 4) => {
  if (!txHash || txHash.length < prefixLength + suffixLength) {
    return txHash;
  }
  
  return `${txHash.slice(0, prefixLength)}...${txHash.slice(-suffixLength)}`;
};
