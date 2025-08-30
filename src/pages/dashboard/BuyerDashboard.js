import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield,
  Leaf,
  Award,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import simpleCreditsService from '../../services/simpleCreditsService';
import marketplaceService from '../../services/marketplaceService';
import realtimeService from '../../services/realtimeService';
import PurchaseCreditModal from '../../components/modals/PurchaseCreditModal';
import RetireCreditModal from '../../components/modals/RetireCreditModal';
import { createTestCredit, checkAvailableCredits } from '../../utils/createTestCredit';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data states
  const [availableCredits, setAvailableCredits] = useState([]);
  const [userCredits, setUserCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  
  // Modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBuyerData();
    setupRealtimeSubscriptions();

    return () => {
      realtimeService.unsubscribeAll();
    };
  }, [user]);

  const loadBuyerData = async () => {
    try {
      setLoading(true);
      const [creditsData, userCreditsData, transactionsData, statsData] = await Promise.all([
        marketplaceService.getMarketplaceCredits(), // Use marketplace service with pricing
        marketplaceService.getUserOwnedCredits(), // Get user's owned credits
        simpleCreditsService.getUserTransactions(),
        marketplaceService.getMarketStats() // Get marketplace stats
      ]);
      
      setAvailableCredits(creditsData);
      setUserCredits(userCreditsData);
      setTransactions(transactionsData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Error loading buyer data:', error);
      // Fallback to simple service if marketplace fails
      try {
        const [fallbackCredits, fallbackUserCredits, fallbackTransactions, fallbackStats] = await Promise.all([
          simpleCreditsService.getAvailableCredits(),
          simpleCreditsService.getUserCredits(),
          simpleCreditsService.getUserTransactions(),
          simpleCreditsService.getSystemStats()
        ]);
        setAvailableCredits(fallbackCredits);
        setUserCredits(fallbackUserCredits);
        setTransactions(fallbackTransactions);
        setSystemStats(fallbackStats);
      } catch (fallbackError) {
        console.error('Fallback loading also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = async () => {
    try {
      await realtimeService.initialize();
      await realtimeService.subscribeToUserUpdates((update) => {
        console.log('Realtime update:', update);
        handleRealtimeUpdate(update);
      });
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
    }
  };

  const handleRealtimeUpdate = (update) => {
    loadBuyerData(); // Refresh all data when any update occurs
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBuyerData();
    setRefreshing(false);
  };

  const handlePurchaseCredit = (credit) => {
    setSelectedCredit(credit);
    setShowPurchaseModal(true);
  };

  const handleRetireCredit = (credit) => {
    setSelectedCredit(credit);
    setShowRetireModal(true);
  };

  const handleViewOnBlockchain = (txHash) => {
    if (txHash) {
      window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
    }
  };

  // Calculate compliance metrics from real data
  const complianceMetrics = {
    totalCreditsOwned: userCredits.length,
    totalVolume: userCredits.reduce((sum, credit) => sum + parseFloat(credit.volume || 0), 0),
    creditsRetired: userCredits.filter(credit => credit.status === 'retired').length,
    complianceTarget: 2000, // This could come from user settings
    carbonOffset: userCredits.reduce((sum, credit) => sum + parseFloat(credit.volume || 0), 0) * 0.5 // Rough calculation
  };

  // Filter available credits
  const filteredCredits = availableCredits.filter(credit => {
    const matchesSearch = credit.token_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading buyer data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-emerald-600" />
              Industry Buyer Dashboard
            </h1>
            <p className="text-gray-600">Manage your green hydrogen credit portfolio and compliance</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{complianceMetrics.totalCreditsOwned}</div>
                <div className="text-sm text-gray-500">Total Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{complianceMetrics.creditsRetired}</div>
                <div className="text-sm text-gray-500">Credits Retired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(complianceMetrics.carbonOffset)}t</div>
                <div className="text-sm text-gray-500">CO₂ Offset</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compliance Progress */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Progress</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress to Target</span>
          <span className="text-sm font-medium text-gray-800">
            {complianceMetrics.totalCreditsOwned} / {complianceMetrics.complianceTarget} credits
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(complianceMetrics.totalCreditsOwned / complianceMetrics.complianceTarget) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {Math.round((complianceMetrics.totalCreditsOwned / complianceMetrics.complianceTarget) * 100)}% of annual compliance target achieved
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/70">
        <TabButton 
          id="marketplace" 
          label="Credit Marketplace" 
          isActive={activeTab === 'marketplace'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="portfolio" 
          label="My Portfolio" 
          isActive={activeTab === 'portfolio'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="compliance" 
          label="Compliance Tracking" 
          isActive={activeTab === 'compliance'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="analytics" 
          label="Analytics" 
          isActive={activeTab === 'analytics'} 
          onClick={setActiveTab} 
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'marketplace' && (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/70">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search credits by ID or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="issued">Available</option>
                </select>
                <button 
                  onClick={async () => {
                    try {
                      await createTestCredit();
                      await loadBuyerData(); // Refresh data
                    } catch (error) {
                      console.error('Failed to create test credit:', error);
                      alert('Failed to create test credit: ' + error.message);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Test Credit
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await checkAvailableCredits();
                    } catch (error) {
                      console.error('Failed to check credits:', error);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Check Available
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Available Green Hydrogen Credits ({filteredCredits.length} credits)
            </h2>
            
            <div className="space-y-4">
              {filteredCredits.map((credit) => (
                <div key={credit.id} className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Credit #{credit.token_id || credit.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          credit.status === 'issued' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {credit.status === 'issued' ? 'Available' : credit.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                          VERIFIED
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <div className="font-medium text-gray-800">{credit.volume} kg H₂</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium text-gray-800">{new Date(credit.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>
                          <div className="font-medium text-gray-800">{credit.metadata?.description || 'Green Hydrogen Credit'}</div>
                        </div>
                      </div>
                      
                      {credit.blockchain_tx_hash && (
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          <span>Blockchain Hash: {credit.blockchain_tx_hash}</span>
                          <button 
                            onClick={() => handleViewOnBlockchain(credit.blockchain_tx_hash)}
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {credit.pricing ? (
                        <>
                          <div className="text-2xl font-bold text-gray-800">${credit.pricing.unitPrice}</div>
                          <div className="text-sm text-gray-500">per kg H₂</div>
                          <div className="text-lg font-bold text-green-600 mt-1">${credit.pricing.totalPrice}</div>
                          <div className="text-xs text-gray-500">total price</div>
                          {/* Show pricing factors */}
                          <div className="flex gap-1 mt-2 justify-end">
                            {credit.pricing.factors.volumeDiscount && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Bulk</span>
                            )}
                            {credit.pricing.factors.blockchainPremium && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Verified</span>
                            )}
                            {credit.pricing.factors.ageFactor < 7 && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Fresh</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-gray-800">$25.00</div>
                          <div className="text-sm text-gray-500">per kg H₂</div>
                        </>
                      )}
                      <button 
                        onClick={() => handlePurchaseCredit(credit)}
                        className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {credit.pricing ? `Buy $${credit.pricing.totalPrice}` : 'Purchase'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCredits.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No credits available</p>
                  <p className="text-sm">Check back later for new green hydrogen credits</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'portfolio' && (
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            My Credit Portfolio ({userCredits.length} credits)
          </h2>
          
          <div className="space-y-4">
            {userCredits.map((credit) => (
              <div key={credit.id} className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Credit #{credit.token_id || credit.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        credit.status === 'issued' ? 'bg-green-100 text-green-800' :
                        credit.status === 'retired' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {credit.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                        OWNED
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <div className="font-medium text-gray-800">{credit.volume} kg H₂</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Acquired:</span>
                        <div className="font-medium text-gray-800">{new Date(credit.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Description:</span>
                        <div className="font-medium text-gray-800">{credit.metadata?.description || 'Green Hydrogen Credit'}</div>
                      </div>
                    </div>
                    
                    {credit.blockchain_tx_hash && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>Blockchain Hash: {credit.blockchain_tx_hash}</span>
                        <button 
                          onClick={() => handleViewOnBlockchain(credit.blockchain_tx_hash)}
                          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {credit.status !== 'retired' && (
                      <button 
                        onClick={() => handleRetireCredit(credit)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Retire Credits
                      </button>
                    )}
                    <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {userCredits.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No credits in your portfolio</p>
                <p className="text-sm">Purchase credits from the marketplace to start building your portfolio</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Compliance & Reporting
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Carbon Reduction Goals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Target:</span>
                  <span className="font-medium text-gray-800">10,000t CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Achieved:</span>
                  <span className="font-medium text-green-600">7,500t CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-orange-600">2,500t CO₂</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Regulatory Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">EU Taxonomy Compliance:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Clean Steel Initiative:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Net Zero Commitment:</span>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Compliance Report
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Portfolio Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Investment</h3>
              <div className="text-2xl font-bold text-gray-900">$325,000</div>
              <p className="text-sm text-gray-500 mt-1">Across all credits</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Environmental Impact</h3>
              <div className="text-2xl font-bold text-gray-900">7,500t</div>
              <p className="text-sm text-gray-500 mt-1">CO₂ emissions avoided</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Verification Rate</h3>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <p className="text-sm text-gray-500 mt-1">All credits verified</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showPurchaseModal && (
        <PurchaseCreditModal 
          credit={selectedCredit}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedCredit(null);
          }}
          onSuccess={() => {
            setShowPurchaseModal(false);
            setSelectedCredit(null);
            loadBuyerData(); // Refresh data after successful purchase
          }}
        />
      )}
      
      {showRetireModal && (
        <RetireCreditModal 
          credit={selectedCredit}
          isOpen={showRetireModal}
          onClose={() => {
            setShowRetireModal(false);
            setSelectedCredit(null);
          }}
          onSuccess={() => {
            setShowRetireModal(false);
            setSelectedCredit(null);
            loadBuyerData(); // Refresh data after successful retirement
          }}
        />
      )}
    </motion.div>
  );
};

export default BuyerDashboard;
