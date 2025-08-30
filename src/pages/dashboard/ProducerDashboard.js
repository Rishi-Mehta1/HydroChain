import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import MagicBento from '../../components/ui/MagicBento';

const ProducerDashboard = () => {
  const [activeTab, setActiveTab] = useState('production');

  // Mock data for demonstration
  const productionStats = {
    totalProduced: 2500, // MWh
    creditsIssued: 2200,
    pendingVerification: 300,
    monthlyGrowth: 15.2
  };

  const recentProduction = [
    {
      id: 'PROD-001',
      date: '2024-08-29',
      amount: 150,
      renewable: 'Wind + Solar',
      status: 'Verified',
      creditsIssued: 140
    },
    {
      id: 'PROD-002', 
      date: '2024-08-28',
      amount: 200,
      renewable: 'Solar + Electrolysis',
      status: 'Pending Verification',
      creditsIssued: 0
    }
  ];

  // Magic Bento Cards Data
  const statsCards = [
    {
      id: 'production',
      title: 'Total Production',
      description: 'Green hydrogen produced this month',
      label: 'MWh',
      value: productionStats.totalProduced,
      icon: Zap,
      gradient: 'linear-gradient(135deg, #10b981, #16a34a)',
      progress: 75,
      trend: 12.5,
      onClick: () => setActiveTab('production')
    },
    {
      id: 'credits',
      title: 'Credits Issued',
      description: 'Verified blockchain credits generated',
      label: 'Credits',
      value: productionStats.creditsIssued,
      icon: Award,
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      progress: 88,
      trend: 8.3,
      onClick: () => setActiveTab('credits')
    },
    {
      id: 'verification',
      title: 'Pending Verification',
      description: 'Production awaiting third-party verification',
      label: 'MWh',
      value: productionStats.pendingVerification,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      progress: 30,
      trend: -5.2,
      onClick: () => setActiveTab('verification')
    },
    {
      id: 'facilities',
      title: 'Active Facilities',
      description: 'Production facilities in operation',
      label: 'Facilities',
      value: 3,
      icon: Factory,
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      progress: 100,
      trend: 0,
      onClick: () => setActiveTab('facilities')
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
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Green Hydrogen Producer Dashboard</h1>
          <p className="text-gray-600">Manage your production, issue credits, and track verification status</p>
        </div>
      </div>

      {/* Interactive Stats Cards with Magic Bento Effects */}
      <MagicBento 
        cards={statsCards}
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        className=""
      />

      {/* Production Growth */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Production Growth</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Growth Rate</span>
          <span className="text-sm font-medium text-gray-800">
            +{productionStats.monthlyGrowth}% from last month
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(productionStats.monthlyGrowth * 2, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Excellent performance! Production is trending upward.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/70">
        <TabButton 
          id="production" 
          label="Production Overview" 
          isActive={activeTab === 'production'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="credits" 
          label="Credit Issuance" 
          isActive={activeTab === 'credits'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="verification" 
          label="Verification Status" 
          isActive={activeTab === 'verification'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="facilities" 
          label="Facility Management" 
          isActive={activeTab === 'facilities'} 
          onClick={setActiveTab} 
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'production' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Production Data
          </h2>
          
          <div className="space-y-4">
            {recentProduction.map((prod) => (
              <div key={prod.id} className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{prod.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prod.status === 'Verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {prod.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium text-gray-800">{prod.date}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium text-gray-800">{prod.amount} MWh</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <div className="font-medium text-gray-800">{prod.renewable}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Credits Issued:</span>
                        <div className="font-medium text-gray-800">{prod.creditsIssued} credits</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Issue Credits
                    </button>
                    <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Record New Production
            </button>
          </div>
        </div>
      )}

      {activeTab === 'credits' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Credit Issuance Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue New Credits</h3>
              <p className="text-gray-600 text-sm mb-4">
                Create blockchain-verified credits for your verified production
              </p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Issue Credits
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Verification</h3>
              <p className="text-gray-600 text-sm mb-4">
                Submit production data and renewable source documentation
              </p>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Upload Data
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">View Reports</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access detailed production and credit issuance reports
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification & Audit Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Production Facility A</h3>
                  <p className="text-sm text-gray-600">Last audit: 2024-08-15</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Verified
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Production Facility B</h3>
                  <p className="text-sm text-gray-600">Pending audit scheduled for 2024-09-01</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'facilities' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Facility Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Facility Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium text-green-600">92.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Maintenance:</span>
                  <span className="font-medium text-gray-800">2024-09-15</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Renewable Sources</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Power:</span>
                  <span className="font-medium text-blue-600">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Solar Power:</span>
                  <span className="font-medium text-yellow-600">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hydroelectric:</span>
                  <span className="font-medium text-cyan-600">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerDashboard;
