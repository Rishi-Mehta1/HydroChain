import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Upload,
  FileText,
  Leaf,
  Factory,
  Award,
  ExternalLink,
  Loader,
  RefreshCcw
} from 'lucide-react';
import MagicBento from '../../components/ui/MagicBento';
import IssueCreditModal from '../../components/modals/IssueCreditModal';
import CreditDetailsModal from '../../components/modals/CreditDetailsModal';
import simpleCreditsService from '../../services/simpleCreditsService';
import realtimeService from '../../services/realtimeService';
import { useAuth } from '../../contexts/AuthContext';

const ProducerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('credits');
  
  // Real data states
  const [userCredits, setUserCredits] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState(null);

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadDashboardData();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      realtimeService.unsubscribeAll();
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [creditsData, statsData, transactionsData] = await Promise.all([
        simpleCreditsService.getUserCredits(),
        simpleCreditsService.getSystemStats(),
        simpleCreditsService.getUserTransactions()
      ]);
      
      setUserCredits(creditsData);
      setSystemStats(statsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
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
    if (update.type === 'credits' || update.type === 'transactions') {
      loadDashboardData(); // Refresh data when updates occur
    }
  };

  const handleIssueCreditsSuccess = () => {
    // Refresh data after successful credit issuance
    loadDashboardData();
  };

  const handleViewDetails = (creditId) => {
    setSelectedCreditId(creditId);
    setIsDetailsModalOpen(true);
  };

  const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Calculate producer-specific stats from real data
  const producerStats = {
    totalCredits: userCredits.length,
    totalVolume: userCredits.reduce((sum, credit) => sum + parseFloat(credit.volume || 0), 0),
    issuedCredits: userCredits.filter(c => c.status === 'issued').length,
    retiredCredits: userCredits.filter(c => c.status === 'retired').length
  };

  // Magic Bento Cards Data with real stats
  const statsCards = [
    {
      id: 'credits',
      title: 'Total Credits',
      description: 'Total credits you have issued',
      label: 'Credits',
      value: producerStats.totalCredits,
      icon: Award,
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      progress: Math.min((producerStats.totalCredits / 10) * 100, 100),
      trend: producerStats.totalCredits > 0 ? 12.5 : 0,
      onClick: () => setActiveTab('credits')
    },
    {
      id: 'volume',
      title: 'Total Volume',
      description: 'Total MWh of credits issued',
      label: 'MWh',
      value: Math.round(producerStats.totalVolume * 100) / 100,
      icon: Zap,
      gradient: 'linear-gradient(135deg, #10b981, #16a34a)',
      progress: Math.min((producerStats.totalVolume / 1000) * 100, 100),
      trend: producerStats.totalVolume > 0 ? 8.3 : 0,
      onClick: () => setActiveTab('production')
    },
    {
      id: 'issued',
      title: 'Active Credits',
      description: 'Credits available for trading',
      label: 'Credits',
      value: producerStats.issuedCredits,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      progress: producerStats.totalCredits > 0 ? (producerStats.issuedCredits / producerStats.totalCredits) * 100 : 0,
      trend: producerStats.issuedCredits > 0 ? 5.7 : 0,
      onClick: () => setActiveTab('credits')
    },
    {
      id: 'retired',
      title: 'Retired Credits',
      description: 'Credits permanently retired for compliance',
      label: 'Credits',
      value: producerStats.retiredCredits,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
      progress: producerStats.totalCredits > 0 ? (producerStats.retiredCredits / producerStats.totalCredits) * 100 : 0,
      trend: 0,
      onClick: () => setActiveTab('verification')
    }
  ];

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-green-600 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
        <div className="flex items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Green Hydrogen Producer Dashboard</h1>
            <p className="text-gray-600">Manage your production, issue credits, and track verification status</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 mb-1">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Interactive Stats Cards with Magic Bento Effects */}
          <MagicBento 
            cards={statsCards}
            gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            className=""
          />

          {/* System Statistics */}
          {systemStats && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{systemStats.totalCredits}</div>
                  <div className="text-sm text-gray-600">Total Credits in System</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{systemStats.totalVolume} MWh</div>
                  <div className="text-sm text-gray-600">Total Volume Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{systemStats.retiredVolume} MWh</div>
                  <div className="text-sm text-gray-600">Volume Retired</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}


      {/* Navigation Tabs */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/70">
          <TabButton 
            id="credits" 
            label="My Credits" 
            isActive={activeTab === 'credits'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="transactions" 
            label="Transaction History" 
            isActive={activeTab === 'transactions'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="actions" 
            label="Quick Actions" 
            isActive={activeTab === 'actions'} 
            onClick={setActiveTab} 
          />
        </div>
      )}

      {/* Tab Content */}
      {!loading && !error && (
        <>
          {activeTab === 'credits' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  My Credits ({userCredits.length})
                </h2>
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Issue New Credits
                </button>
              </div>
              
              {userCredits.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Credits Issued Yet</h3>
                  <p className="text-gray-500 mb-4">Start by issuing your first green hydrogen credits</p>
                  <button
                    onClick={() => setIsIssueModalOpen(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Zap className="w-4 h-4" />
                    Issue First Credits
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userCredits.map((credit) => (
                    <div key={credit.id} className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Credit #{credit.token_id || credit.id.slice(0, 8)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              credit.status === 'issued' 
                                ? 'bg-green-100 text-green-800' 
                                : credit.status === 'retired'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {credit.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Volume:</span>
                              <div className="font-medium text-gray-800">{credit.volume} MWh</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <div className="font-medium text-gray-800">
                                {new Date(credit.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Token ID:</span>
                              <div className="font-medium text-gray-800 font-mono">
                                #{credit.token_id || 'Pending'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Blockchain:</span>
                              <div className="font-medium text-gray-800">
                                {credit.blockchain_tx_hash ? (
                                  <a
                                    href={getEtherscanUrl(credit.blockchain_tx_hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-gray-400">Off-chain</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleViewDetails(credit.id)}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Transaction History ({transactions.length})
              </h2>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
                  <p className="text-gray-500">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'issue' ? 'bg-green-100' :
                            transaction.type === 'transfer' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {transaction.type === 'issue' ? <Zap className="w-4 h-4 text-green-600" /> :
                             transaction.type === 'transfer' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
                             <CheckCircle className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 capitalize">{transaction.type}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">{transaction.volume} MWh</div>
                          {transaction.tx_hash && (
                            <a
                              href={getEtherscanUrl(transaction.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              View TX <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue New Credits</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Create blockchain-verified credits for your verified production
                  </p>
                  <button 
                    onClick={() => setIsIssueModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Issue Credits
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Verification</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Submit production data and renewable source documentation
                  </p>
                  <button 
                    onClick={() => alert('Upload verification feature coming soon!')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Upload Data
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">View Reports</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Access detailed production and credit issuance reports
                  </p>
                  <button 
                    onClick={() => alert('Reports feature coming soon!')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      
      {/* Modals */}
      <IssueCreditModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={handleIssueCreditsSuccess}
      />
      
      <CreditDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        creditId={selectedCreditId}
      />
    </div>
  );
};

export default ProducerDashboard;
