import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('marketplace');

  // Mock data for demonstration
  const availableCredits = [
    {
      id: 'GHC-001',
      producer: 'Nordic Green Energy',
      amount: 1000,
      pricePerCredit: 25.50,
      certificationLevel: 'Gold',
      renewableSource: 'Wind + Solar',
      location: 'Norway',
      verificationStatus: 'Verified',
      blockchainHash: '0x1234...5678'
    },
    {
      id: 'GHC-002',
      producer: 'Australian H2 Solutions',
      amount: 750,
      pricePerCredit: 22.00,
      certificationLevel: 'Platinum',
      renewableSource: 'Solar + Electrolysis',
      location: 'Australia',
      verificationStatus: 'Pending Audit',
      blockchainHash: '0x8765...4321'
    }
  ];

  const myPurchases = [
    {
      id: 'TXN-001',
      creditId: 'GHC-003',
      amount: 500,
      totalCost: 12750,
      purchaseDate: '2024-08-25',
      status: 'Completed',
      retirementStatus: 'Active',
      complianceUse: 'Steel Production'
    }
  ];

  const complianceMetrics = {
    totalCreditsOwned: 1500,
    creditsRetired: 500,
    complianceTarget: 2000,
    carbonOffset: 7500 // tons CO2
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Industry Buyer Dashboard</h1>
            <p className="text-gray-600">Manage your green hydrogen credit portfolio and compliance</p>
          </div>
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
              <div className="text-2xl font-bold text-orange-600">{complianceMetrics.carbonOffset}t</div>
              <div className="text-sm text-gray-500">CO₂ Offset</div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Available Green Hydrogen Credits
          </h2>
          
          <div className="space-y-4">
            {availableCredits.map((credit) => (
              <div key={credit.id} className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{credit.producer}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        credit.verificationStatus === 'Verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {credit.verificationStatus}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {credit.certificationLevel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Credit ID:</span>
                        <div className="font-medium text-gray-800">{credit.id}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium text-gray-800">{credit.amount} MWh</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <div className="font-medium text-gray-800">{credit.renewableSource}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <div className="font-medium text-gray-800">{credit.location}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Blockchain Hash: {credit.blockchainHash}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">${credit.pricePerCredit}</div>
                    <div className="text-sm text-gray-500">per credit</div>
                    <button className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/70">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            My Credit Portfolio
          </h2>
          
          <div className="space-y-4">
            {myPurchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Credit: {purchase.creditId}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {purchase.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium text-gray-800">{purchase.amount} MWh</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Cost:</span>
                        <div className="font-medium text-gray-800">${purchase.totalCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Purchase Date:</span>
                        <div className="font-medium text-gray-800">{purchase.purchaseDate}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Used For:</span>
                        <div className="font-medium text-gray-800">{purchase.complianceUse}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Retire Credits
                    </button>
                    <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    </div>
  );
};

export default BuyerDashboard;
