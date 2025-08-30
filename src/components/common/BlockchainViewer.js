import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Clock, 
  Hash, 
  Calendar,
  Zap,
  AlertCircle,
  X,
  RefreshCw,
  Shield
} from 'lucide-react';

const BlockchainViewer = ({ isOpen, onClose, transaction, txHash }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use transaction prop or create a minimal object from txHash
  const txData = transaction || {
    tx_hash: txHash,
    type: 'blockchain',
    status: 'confirmed',
    created_at: new Date().toISOString()
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getEtherscanUrl = (hash) => {
    // For hackathon demo, we'll use Sepolia testnet
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  const formatTxHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'issued':
      case 'retired':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'issue':
        return <Zap className="w-4 h-4" />;
      case 'transfer':
        return <RefreshCw className="w-4 h-4" />;
      case 'retire':
        return <Shield className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  if (!isOpen || (!transaction && !txHash)) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Blockchain Transaction</h2>
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
        <div className="p-6 space-y-6">
          {/* Transaction Hash */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Transaction Hash
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <code className="bg-white px-3 py-2 rounded-lg border text-sm font-mono flex-1">
                  {txData.tx_hash || 'N/A'}
                </code>
                {txData.tx_hash && (
                  <button
                    onClick={() => copyToClipboard(txData.tx_hash)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {txData.tx_hash && (
                <a
                  href={getEtherscanUrl(txData.tx_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Etherscan
                </a>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Type */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  {getTypeIcon(txData.type)}
                  Type:
                </span>
                <span className="font-medium text-gray-800 capitalize">
                  {txData.type || 'Unknown'}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(txData.status)}`}>
                  {txData.status || 'Unknown'}
                </span>
              </div>

              {/* Volume */}
              {txData.volume && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-semibold text-gray-800">{txData.volume} MWh</span>
                </div>
              )}

              {/* Credit ID */}
              {txData.credit_id && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Credit ID:</span>
                  <span className="font-mono text-gray-800">#{txData.credit_id}</span>
                </div>
              )}

              {/* Date */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timestamp:
                </span>
                <span className="font-medium text-gray-800">
                  {formatDate(txData.created_at)}
                </span>
              </div>

              {/* From/To Users */}
              {txData.from_user && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-gray-800 text-sm">
                    {txData.from_user.slice(0, 8)}...{txData.from_user.slice(-8)}
                  </span>
                </div>
              )}

              {txData.to_user && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-gray-800 text-sm">
                    {txData.to_user.slice(0, 8)}...{txData.to_user.slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Blockchain Information
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-medium">Ethereum Sepolia (Testnet)</span>
              </div>
              <div className="flex justify-between">
                <span>Explorer:</span>
                <span className="font-medium">Etherscan</span>
              </div>
              {!txData.tx_hash && (
                <div className="flex items-center gap-2 text-amber-600 mt-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Transaction hash not available for this operation</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {txData.tx_hash && (
              <button
                onClick={() => window.open(getEtherscanUrl(txData.tx_hash), '_blank')}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainViewer;
