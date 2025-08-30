import React, { useState } from 'react';
import { X, Shield, ExternalLink, CheckCircle, AlertCircle, Loader, Award } from 'lucide-react';
import simpleCreditsService from '../../services/simpleCreditsService';
import aiAutomationService from '../../services/aiAutomationService';
import { supabase } from '../../lib/supabaseClient';

const RetireCreditModal = ({ isOpen, onClose, credit, onSuccess }) => {
  const [reason, setReason] = useState('Compliance retirement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRetire = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await simpleCreditsService.retireCredit(credit.id, reason);

      setSuccess({
        message: 'Credit retired successfully!',
        txHash: response.tx_hash,
        reason: reason,
        volume: credit.volume
      });

      // Send AI automation notification for credit retirement
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ownerInfo = await aiAutomationService.getUserInfo(user, supabase);
          
          const retiredCreditData = {
            ...credit,
            status: 'retired',
            volume: credit.volume
          };
          
          await aiAutomationService.notifyCreditRetired(
            retiredCreditData,
            ownerInfo,
            reason
          );
          console.log('🤖 AI automation notification sent for credit retirement');
        }
      } catch (notificationError) {
        console.log('ℹ️ AI automation notification failed:', notificationError.message);
      }

      if (onSuccess) {
        onSuccess(response);
      }

    } catch (err) {
      console.error('Error retiring credit:', err);
      setError(err.message || 'Failed to retire credit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setReason('Compliance retirement');
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
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Retire Green Hydrogen Credit</h2>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Credit Retired Successfully!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {success.volume} MWh credit has been permanently retired and removed from circulation.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium text-gray-800">{success.reason}</span>
                  </div>
                  
                  {success.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Transaction:</span>
                      <a
                        href={getEtherscanUrl(success.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-xs"
                      >
                        {success.txHash.slice(0, 6)}...{success.txHash.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            // Retire Form State
            <div className="space-y-6">
              {/* Credit Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit to Retire</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="font-mono text-gray-800">#{credit.token_id || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-semibold text-gray-800">{credit.volume} MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                      {credit.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800">{formatDate(credit.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Retirement Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Enter the reason for retiring this credit"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a reason for compliance and audit purposes
                </p>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Permanent Action Warning
                </h4>
                <p className="text-sm text-red-700">
                  Retiring this credit is permanent and irreversible. The credit will be marked as "retired" 
                  and removed from circulation. This action cannot be undone.
                </p>
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
                  onClick={handleRetire}
                  disabled={loading || !reason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Retiring...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Retire Credit
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

export default RetireCreditModal;
