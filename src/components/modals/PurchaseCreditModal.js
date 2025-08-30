import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ExternalLink, CheckCircle, AlertCircle, Loader, Zap, Info, DollarSign, TrendingUp, Clock, Shield } from 'lucide-react';
import simpleCreditsService from '../../services/simpleCreditsService';
import marketplaceService from '../../services/marketplaceService';

const PurchaseCreditModal = ({ isOpen, onClose, credit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pricing, setPricing] = useState(null);

  // Calculate pricing when credit changes
  useEffect(() => {
    if (credit) {
      const calculatedPricing = marketplaceService.calculateCreditPrice(credit);
      setPricing(calculatedPricing);
    }
  }, [credit]);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🛒 Starting real purchase process...');
      
      // Use the simple purchase method that works with RLS constraints
      const result = await marketplaceService.purchaseCreditSimple(credit.id);
      
      setSuccess({
        message: result.message,
        transaction: result.transaction,
        blockchainDetails: result.blockchainDetails,
        explorerUrl: result.blockchainDetails?.explorerUrl
      });

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Error purchasing credit:', err);
      setError(err.message || 'Failed to complete purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setSuccess(null);
    onClose();
  };

  const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen || !credit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Purchase Green Hydrogen Credit</h2>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🎉 Purchase Successful!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {success.message}
                </p>
                
                {/* Demo Environment Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">Demo Environment</p>
                      <p className="text-blue-700">
                        Your purchase has been recorded successfully! In production, this would also transfer the credit ownership on-chain.
                      </p>
                    </div>
                  </div>
                </div>
                
                {success.transaction && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Volume:</span>
                        <span className="font-medium">{success.transaction.volume} kg H₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Total Paid:</span>
                        <span className="font-semibold text-green-800">${success.transaction.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Unit Price:</span>
                        <span className="font-medium">${success.transaction.unitPrice}/kg</span>
                      </div>
                      {success.transaction.blockchainTx && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Blockchain TX:</span>
                          <span className="font-mono text-xs">{success.transaction.blockchainTx.substring(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {success.explorerUrl && (
                  <button
                    onClick={() => window.open(success.explorerUrl, '_blank')}
                    className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Block Explorer
                  </button>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            // Purchase State
            <div className="space-y-6">
              {/* Credit Details */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="font-mono text-gray-800">#{credit.token_id || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-semibold text-gray-800">{credit.volume} kg H₂</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                      {credit.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800">{formatDate(credit.created_at)}</span>
                  </div>
                  {credit.blockchain_tx_hash && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Blockchain:</span>
                      <a
                        href={getEtherscanUrl(credit.blockchain_tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-sm"
                      >
                        {credit.blockchain_tx_hash.slice(0, 6)}...{credit.blockchain_tx_hash.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Pricing */}
              {pricing && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Dynamic Pricing
                    </h3>
                    {pricing.factors.blockchainPremium && (
                      <Shield className="w-4 h-4 text-blue-500" title="Blockchain Verified Premium" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">${pricing.factors.basePrice}/kg H₂</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-semibold text-lg text-green-600">${pricing.unitPrice}/kg H₂</span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Price:</span>
                        <span className="text-2xl font-bold text-green-600">${pricing.totalPrice}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {pricing.volume} kg H₂ × ${pricing.unitPrice}/kg
                      </div>
                    </div>
                    
                    {/* Pricing Factors */}
                    <div className="mt-4 pt-3 border-t border-green-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing Factors:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {pricing.factors.volumeDiscount && (
                          <div className="flex items-center gap-1 text-green-700">
                            <TrendingUp className="w-3 h-3" />
                            <span>Volume Discount</span>
                          </div>
                        )}
                        {pricing.factors.blockchainPremium && (
                          <div className="flex items-center gap-1 text-blue-700">
                            <Shield className="w-3 h-3" />
                            <span>Blockchain Premium</span>
                          </div>
                        )}
                        {pricing.factors.ageFactor < 7 && (
                          <div className="flex items-center gap-1 text-purple-700">
                            <Clock className="w-3 h-3" />
                            <span>Fresh Premium</span>
                          </div>
                        )}
                        {pricing.factors.productionMethod && (
                          <div className="flex items-center gap-1 text-orange-700">
                            <Zap className="w-3 h-3" />
                            <span>{pricing.factors.productionMethod} Method</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Price Multiplier: {pricing.factors.priceMultiplier}x
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Real Purchase Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Real Blockchain Purchase
                </h4>
                <p className="text-sm text-blue-700 mb-2">
                  This will perform a REAL purchase with actual blockchain transactions:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• Transfer credit ownership to your account</li>
                  <li>• Create blockchain transaction record (FREE!)</li>
                  <li>• Remove credit from marketplace</li>
                  <li>• Add credit to your portfolio</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

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
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      {pricing ? `Purchase for $${pricing.totalPrice}` : 'Purchase Credit'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCreditModal;
