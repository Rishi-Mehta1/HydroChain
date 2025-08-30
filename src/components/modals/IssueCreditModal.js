import React, { useState } from 'react';
import { X, Zap, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import simpleCreditsService from '../../services/simpleCreditsService';
import mockCreditsService from '../../services/mockCreditsService';
import blockchainCreditsService from '../../services/blockchainCreditsService';
import aiAutomationService from '../../services/aiAutomationService';
import { supabase } from '../../lib/supabaseClient';

const IssueCreditModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    volume: '',
    description: 'Green Hydrogen Credit',
    useBlockchain: false // New option for real blockchain
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!formData.volume || parseFloat(formData.volume) <= 0) {
        throw new Error('Please enter a valid volume greater than 0');
      }

      let response;
      
      if (formData.useBlockchain) {
        // Use real blockchain transactions via MetaMask
        console.log('🔗 Using REAL blockchain transaction');
        response = await blockchainCreditsService.issueCredits(
          parseFloat(formData.volume),
          formData.description
        );
      } else {
        // Use Edge Function with fallback to mock
        try {
          response = await simpleCreditsService.issueCredits(
            parseFloat(formData.volume),
            formData.description
          );
        } catch (edgeFunctionError) {
          console.warn('Edge Function failed, using mock service:', edgeFunctionError.message);
          response = await mockCreditsService.issueCredits(
            parseFloat(formData.volume),
            formData.description
          );
        }
      }

      setSuccess({
        message: 'Credits issued successfully!',
        txHash: response.tx_hash,
        tokenId: response.token_id,
        volume: formData.volume,
        isRealBlockchain: response.isRealBlockchain || false
      });

      // Send AI automation notification for credit issuance
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const producerInfo = await aiAutomationService.getUserInfo(user, supabase);
          
          const creditData = {
            id: response.credit_id || response.id,
            volume: parseFloat(formData.volume),
            token_id: response.token_id,
            tx_hash: response.tx_hash,
            description: formData.description
          };
          
          await aiAutomationService.notifyCreditIssued(creditData, producerInfo);
          console.log('🤖 AI automation notification sent for credit issuance');
        }
      } catch (notificationError) {
        console.log('ℹ️ AI automation notification failed:', notificationError.message);
      }

      // Reset form
      setFormData({
        volume: '',
        description: 'Green Hydrogen Credit'
      });

      // Notify parent of success
      if (onSuccess) {
        onSuccess(response);
      }

    } catch (err) {
      console.error('Error issuing credits:', err);
      setError(err.message || 'Failed to issue credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during loading
    setFormData({
      volume: '',
      description: 'Green Hydrogen Credit'
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Issue Green Hydrogen Credits</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Credits Issued Successfully!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {success.volume} MWh worth of green hydrogen credits have been issued to the blockchain.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {success.tokenId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Token ID:</span>
                      <span className="font-mono text-gray-800">#{success.tokenId}</span>
                    </div>
                  )}
                  
                  {success.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Transaction:</span>
                      <div className="flex items-center gap-2">
                        {success.isRealBlockchain ? (
                          <a
                            href={getEtherscanUrl(success.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-xs"
                          >
                            {success.txHash.slice(0, 6)}...{success.txHash.slice(-4)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-800">
                            {success.txHash.slice(0, 6)}...{success.txHash.slice(-4)}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          success.isRealBlockchain 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {success.isRealBlockchain ? '🌟 REAL' : 'Mock Data'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Issue More Credits
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (MWh) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter volume in MWh"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount of green hydrogen production to convert to credits
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Brief description of the credit issuance"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Blockchain Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Transaction Type</h4>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="transactionType"
                      checked={!formData.useBlockchain}
                      onChange={() => setFormData({ ...formData, useBlockchain: false })}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={loading}
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-700">Mock Transaction (Testing)</div>
                      <div className="text-xs text-gray-500">Fast, free, perfect for development</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="transactionType"
                      checked={formData.useBlockchain}
                      onChange={() => setFormData({ ...formData, useBlockchain: true })}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={loading}
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Real Blockchain Transaction 
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          🌟 REAL
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Requires MetaMask, costs gas fees, appears on Etherscan!</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.useBlockchain && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚡ Real Blockchain Requirements</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Install MetaMask browser extension</li>
                    <li>• Connect to Sepolia testnet</li>
                    <li>• Have some Sepolia ETH for gas fees</li>
                    <li>• Get test ETH from <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="underline">Sepolia Faucet</a></li>
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">About Green Hydrogen Credits</h4>
                <p className="text-sm text-blue-700">
                  {formData.useBlockchain 
                    ? "Credits will be recorded as REAL transactions on the Sepolia testnet blockchain. You'll get a real transaction hash that you can view on Etherscan!"
                    : "Credits will be stored in the database with mock blockchain data for testing purposes."
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.volume}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Issuing Credits...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Issue Credits
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCreditModal;
