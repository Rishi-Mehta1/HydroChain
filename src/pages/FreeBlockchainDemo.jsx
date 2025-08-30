import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ExternalLink, 
  CheckCircle, 
  DollarSign,
  Clock,
  Shield,
  Globe,
  ArrowRight,
  Gift
} from 'lucide-react';
import NetworkSelector from '../components/NetworkSelector';
import CreditIssueForm from '../components/forms/CreditIssueForm';
import freeBlockchainService from '../services/freeBlockchainService';

const FreeBlockchainDemo = () => {
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState(null);

  const features = [
    {
      icon: DollarSign,
      title: '100% FREE Transactions',
      description: 'Zero cost blockchain transactions on testnets. No need to buy expensive ETH!',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      title: 'Instant Setup',
      description: 'Get started immediately with automatic faucet integration for free tokens.',
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: 'Real Blockchain',
      description: 'All transactions are real and verifiable on public block explorers.',
      color: 'text-purple-500'
    },
    {
      icon: Globe,
      title: 'Multiple Networks',
      description: 'Choose from Polygon Mumbai, BSC Testnet, or Avalanche Fuji networks.',
      color: 'text-orange-500'
    }
  ];

  const supportedNetworks = [
    {
      name: 'Mumbai (Polygon)',
      description: 'Polygon testnet with FREE MATIC tokens',
      explorer: 'mumbai.polygonscan.com',
      faucet: 'mumbaifaucet.com',
      currency: 'MATIC'
    },
    {
      name: 'BSC Testnet',
      description: 'Binance Smart Chain testnet with FREE BNB tokens',
      explorer: 'testnet.bscscan.com',
      faucet: 'testnet.binance.org/faucet-smart',
      currency: 'tBNB'
    },
    {
      name: 'Avalanche Fuji',
      description: 'Avalanche testnet with FREE AVAX tokens',
      explorer: 'testnet.snowtrace.io',
      faucet: 'faucet.avax.network',
      currency: 'AVAX'
    }
  ];

  const handleNetworkConnect = (network) => {
    setConnectedNetwork(network);
    setShowNetworkSelector(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              FREE Blockchain Demo
            </h1>
            <Gift className="w-12 h-12 text-green-500" />
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Experience real blockchain transactions without spending a single cent!
          </p>
          
          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full inline-flex">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              No ETH Required • No Gas Fees • Real Transactions
            </span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Network Status */}
        {connectedNetwork && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                Connected to {connectedNetwork.name}
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              You're now connected to a FREE blockchain network! You can create real transactions 
              that will be visible on the block explorer without any cost.
            </p>
            <button
              onClick={() => setShowIssueForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Issue Credits on FREE Blockchain
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => setShowNetworkSelector(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium"
          >
            <Globe className="w-5 h-5" />
            Choose FREE Network
          </button>
          
          <button
            onClick={() => setShowIssueForm(true)}
            disabled={!connectedNetwork}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5" />
            Demo Credit Issuance
          </button>
        </motion.div>

        {/* Supported Networks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Supported FREE Networks
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {supportedNetworks.map((network, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {network.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {network.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Currency:</span>
                    <span className="font-medium">{network.currency}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Explorer:</span>
                    <a 
                      href={`https://${network.explorer}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Faucet:</span>
                    <a 
                      href={`https://${network.faucet}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Gift className="w-3 h-3" />
                      Free Tokens
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Choose Network
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Select from our supported free testnets. Each network offers completely free transactions.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Get Free Tokens
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Automatically request free tokens from faucets or visit the faucet websites.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Create Transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Issue credits and create real blockchain transactions that appear on block explorers.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Network Selector Modal */}
        {showNetworkSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <NetworkSelector 
                onNetworkChange={handleNetworkConnect}
                className="bg-white dark:bg-gray-800"
              />
              <button
                onClick={() => setShowNetworkSelector(false)}
                className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Credit Issue Form Modal */}
        <CreditIssueForm 
          isOpen={showIssueForm}
          onClose={() => setShowIssueForm(false)}
        />
      </div>
    </div>
  );
};

export default FreeBlockchainDemo;
