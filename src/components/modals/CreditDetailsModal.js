import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Clock, CheckCircle, AlertCircle, Loader, Zap, Users, Calendar } from 'lucide-react';
import simpleCreditsService from '../../services/simpleCreditsService';

const CreditDetailsModal = ({ isOpen, onClose, creditId }) => {
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && creditId) {
      fetchCreditDetails();
    }
  }, [isOpen, creditId]);

  const fetchCreditDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simpleCreditsService.getCreditById(creditId);
      setCredit(data);
    } catch (err) {
      console.error('Error fetching credit details:', err);
      setError(err.message || 'Failed to load credit details');
    } finally {
      setLoading(false);
    }
  };

  const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
        return 'text-green-600 bg-green-100';
      case 'retired':
        return 'text-gray-600 bg-gray-100';
      case 'transferred':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'issue':
        return <Zap className="w-4 h-4" />;
      case 'transfer':
        return <Users className="w-4 h-4" />;
      case 'retire':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Credit Details</h2>
                {credit && (
                  <p className="text-sm text-gray-500">Token ID: #{credit.token_id || 'N/A'}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading credit details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          ) : credit ? (
            <div className="space-y-6">
              {/* Credit Overview */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-semibold text-gray-800">{credit.volume} MWh</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(credit.status)}`}>
                          {credit.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-gray-800">{formatDate(credit.created_at)}</span>
                      </div>
                      {credit.updated_at !== credit.created_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-gray-800">{formatDate(credit.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Blockchain Details</h3>
                    <div className="space-y-3">
                      {credit.token_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Token ID:</span>
                          <span className="font-mono text-gray-800">#{credit.token_id}</span>
                        </div>
                      )}
                      {credit.blockchain_tx_hash ? (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Transaction:</span>
                          <a
                            href={getEtherscanUrl(credit.blockchain_tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-sm"
                          >
                            {credit.blockchain_tx_hash.slice(0, 8)}...{credit.blockchain_tx_hash.slice(-6)}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction:</span>
                          <span className="text-gray-400 text-sm">Not on blockchain</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network:</span>
                        <span className="font-medium text-gray-800">Sepolia Testnet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {credit.metadata && (
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
                    <div className="bg-white rounded-lg p-4">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {typeof credit.metadata === 'string' 
                          ? credit.metadata 
                          : JSON.stringify(credit.metadata, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              {credit.transactions && credit.transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Transaction History
                  </h3>
                  <div className="space-y-3">
                    {credit.transactions.map((transaction, index) => (
                      <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTransactionTypeIcon(transaction.type)}
                            <span className="font-medium text-gray-800 capitalize">{transaction.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(transaction.created_at)}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Volume:</span>
                            <div className="font-medium text-gray-800">{transaction.volume} MWh</div>
                          </div>
                          {transaction.from_user && (
                            <div>
                              <span className="text-gray-500">From:</span>
                              <div className="font-medium text-gray-800">{transaction.from_user}</div>
                            </div>
                          )}
                          {transaction.to_user && (
                            <div>
                              <span className="text-gray-500">To:</span>
                              <div className="font-medium text-gray-800">{transaction.to_user}</div>
                            </div>
                          )}
                        </div>

                        {transaction.tx_hash && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <a
                              href={getEtherscanUrl(transaction.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View on Etherscan: {transaction.tx_hash.slice(0, 8)}...{transaction.tx_hash.slice(-6)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No credit data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditDetailsModal;
