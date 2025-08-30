import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Zap, ExternalLink, AlertCircle } from 'lucide-react';
import { validateCreditForm, generateCreditId } from '../../utils/helpers';
import freeBlockchainService from '../../services/freeBlockchainService';
import NetworkSelector from '../NetworkSelector';

const CreditIssueForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    productionMethod: '',
    certificationBody: '',
    expiryDate: '',
    facilityId: '',
    co2Reduction: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState('form'); // form, blockchain, success
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateCreditForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setCurrentStep('blockchain');
    
    try {
      console.log('🚀 Starting FREE blockchain transaction...');
      
      // Create description for blockchain transaction
      const description = formData.description || `Green Hydrogen Credit: ${formData.amount} units via ${formData.productionMethod} from ${formData.facilityId}`;
      
      // Issue credits on FREE blockchain
      const result = await freeBlockchainService.issueCredits(formData.amount, description);
      
      setTransactionResult(result);
      setShowSuccess(true);
      setCurrentStep('success');
      
      console.log('✅ FREE blockchain transaction successful!', result);
      
      // Reset form after 5 seconds to let user see the result
      setTimeout(() => {
        setFormData({
          amount: '',
          productionMethod: '',
          certificationBody: '',
          expiryDate: '',
          facilityId: '',
          co2Reduction: '',
          description: ''
        });
        setShowSuccess(false);
        setTransactionResult(null);
        setCurrentStep('form');
        onClose();
      }, 8000);
      
    } catch (error) {
      console.error('❌ FREE blockchain transaction failed:', error);
      setErrors({ blockchain: error.message });
      setCurrentStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Issue New Credits
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Indicator */}
              {currentStep !== 'form' && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      {currentStep === 'blockchain' ? 'Creating FREE Blockchain Transaction...' : 'Transaction Complete!'}
                    </span>
                  </div>
                </div>
              )}

              {/* Blockchain Error */}
              {errors.blockchain && (
                <div className="m-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-300">
                      {errors.blockchain}
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message with Blockchain Details */}
              <AnimatePresence>
                {showSuccess && transactionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="m-6 space-y-4"
                  >
                    {/* Success Header */}
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-green-800 dark:text-green-300 font-semibold">
                            🎉 Credits issued successfully on FREE blockchain!
                          </p>
                          <p className="text-green-700 dark:text-green-400 text-sm">
                            {transactionResult.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Details */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Blockchain Transaction Details
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Network:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {transactionResult.blockchain?.network} (FREE!)
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Token ID:</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-white">
                            {transactionResult.token_id}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">TX Hash:</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-white">
                            {transactionResult.tx_hash?.substring(0, 20)}...
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            FREE! (${transactionResult.isFree ? '0.00' : 'N/A'})
                          </span>
                        </div>
                      </div>
                      
                      {/* View on Explorer Button */}
                      {transactionResult.explorerUrl && (
                        <button
                          onClick={() => window.open(transactionResult.explorerUrl, '_blank')}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Transaction on Block Explorer
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credit Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount of credits"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Production Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Production Method
                  </label>
                  <select
                    name="productionMethod"
                    value={formData.productionMethod}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.productionMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select method</option>
                    <option value="solar">Solar Electrolysis</option>
                    <option value="wind">Wind Electrolysis</option>
                    <option value="hydro">Hydro Electrolysis</option>
                    <option value="biomass">Biomass Gasification</option>
                  </select>
                  {errors.productionMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.productionMethod}</p>
                  )}
                </div>

                {/* Certification Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certification Body
                  </label>
                  <select
                    name="certificationBody"
                    value={formData.certificationBody}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.certificationBody ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select certification body</option>
                    <option value="igha">International Green Hydrogen Alliance</option>
                    <option value="ghc">Global Hydrogen Certification</option>
                    <option value="eu">EU Green Hydrogen Standard</option>
                  </select>
                  {errors.certificationBody && (
                    <p className="mt-1 text-sm text-red-600">{errors.certificationBody}</p>
                  )}
                </div>

                {/* Facility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Production Facility
                  </label>
                  <select
                    name="facilityId"
                    value={formData.facilityId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select facility</option>
                    <option value="FAC001">Solar Farm Alpha</option>
                    <option value="FAC002">Wind Park Beta</option>
                    <option value="FAC003">Hydro Plant Gamma</option>
                  </select>
                </div>

                {/* CO2 Reduction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated CO2 Reduction (tons)
                  </label>
                  <input
                    type="number"
                    name="co2Reduction"
                    value={formData.co2Reduction}
                    onChange={handleChange}
                    placeholder="Enter CO2 reduction"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add any additional details about this credit issuance..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Issue Credits on FREE Blockchain
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreditIssueForm;
