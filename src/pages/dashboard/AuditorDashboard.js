import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Building,
  Users,
  Activity,
  BarChart3,
  ExternalLink,
  Award,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import simpleCreditsService from '../../services/simpleCreditsService';
import realtimeService from '../../services/realtimeService';

const AuditorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAuditorData();
    setupRealtimeSubscriptions();

    return () => {
      realtimeService.unsubscribeAll();
    };
  }, [user]);

  const loadAuditorData = async () => {
    try {
      setLoading(true);
      const [creditsData, transactionsData, statsData] = await Promise.all([
        simpleCreditsService.getAvailableCredits(),
        simpleCreditsService.getUserTransactions(),
        simpleCreditsService.getSystemStats()
      ]);
      
      setCredits(creditsData);
      setTransactions(transactionsData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Error loading auditor data:', error);
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
    if (update.type === 'credits') {
      loadAuditorData(); // Refresh data when credits are updated
    } else if (update.type === 'transactions') {
      loadAuditorData(); // Refresh data when transactions occur
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuditorData();
    setRefreshing(false);
  };

  const handleViewOnBlockchain = (txHash) => {
    // Open Sepolia testnet explorer
    if (txHash) {
      window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
    }
  };

  const filteredCredits = credits.filter(credit => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit data...</p>
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
              <Shield className="w-8 h-8 text-emerald-600" />
              Certification Body Dashboard
            </h1>
            <p className="text-gray-600">Monitor system integrity, verify credits, and ensure compliance</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </motion.div>

      {/* System Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats?.totalCredits || 0}</p>
              <p className="text-sm text-emerald-600 mt-1">System wide</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats?.totalVolume || 0}</p>
              <p className="text-sm text-blue-600 mt-1">kg H₂</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Credits</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats?.issuedVolume || 0}</p>
              <p className="text-sm text-green-600 mt-1">kg H₂</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retired Credits</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats?.retiredVolume || 0}</p>
              <p className="text-sm text-orange-600 mt-1">kg H₂</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/70">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'System Overview', icon: BarChart3 },
            { id: 'credits', label: 'Credit Verification', icon: Award },
            { id: 'transactions', label: 'Transaction Monitor', icon: Activity },
            { id: 'compliance', label: 'Compliance Reports', icon: FileCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent System Activity
            </h2>
            
            <div className="space-y-4">
              {systemStats?.recentTransactions?.slice(0, 5).map((transaction, index) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'issue' ? 'bg-green-100' :
                      transaction.type === 'transfer' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {transaction.type === 'issue' && <Award className="w-4 h-4 text-green-600" />}
                      {transaction.type === 'transfer' && <Activity className="w-4 h-4 text-blue-600" />}
                      {transaction.type === 'retire' && <CheckCircle className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{transaction.type} Transaction</p>
                      <p className="text-sm text-gray-600">
                        Credit: {transaction.credits?.token_id || 'N/A'} • Volume: {transaction.volume} kg H₂
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => handleViewOnBlockchain(transaction.tx_hash)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on Chain
                    </button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {selectedTab === 'credits' && (
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
                  <option value="issued">Issued</option>
                  <option value="transferred">Transferred</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Credits List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Credit Verification ({filteredCredits.length} credits)
            </h2>
            
            <div className="space-y-4">
              {filteredCredits.map((credit) => (
                <div key={credit.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Credit #{credit.token_id || credit.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          credit.status === 'issued' ? 'bg-green-100 text-green-800' :
                          credit.status === 'transferred' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {credit.status.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
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
                          <div className="font-medium text-gray-800">
                            {new Date(credit.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>
                          <div className="font-medium text-gray-800">
                            {credit.metadata?.description || 'Green Hydrogen Credit'}
                          </div>
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
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Audit
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCredits.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No credits found</p>
                  <p className="text-sm">Credits will appear here when they are issued by producers</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {selectedTab === 'transactions' && (
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Transaction Monitor ({transactions.length} transactions)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Volume</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Blockchain</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'issue' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.volume} kg H₂
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {transaction.tx_hash ? (
                        <button 
                          onClick={() => handleViewOnBlockchain(transaction.tx_hash)}
                          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {selectedTab === 'compliance' && (
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Compliance & Audit Reports
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Verified:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fraud Detection:</span>
                  <span className="font-medium text-green-600">0 Issues</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Double Counting:</span>
                  <span className="font-medium text-green-600">Protected</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Blockchain Integrity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium text-blue-600">Sepolia Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Block:</span>
                  <span className="font-medium text-gray-800">Just now</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generate Audit Report
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Smart Contract
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AuditorDashboard;
