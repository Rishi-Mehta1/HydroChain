import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Shield, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Lock, 
  Globe,
  Award,
  ArrowRight,
  Factory,
  Building,
  FileCheck
} from 'lucide-react';
import HydroChainLogo from '../components/layout/HydroChainLogo';
import MagicBento from '../components/ui/MagicBento';

const LandingPage = () => {

  // Transform features data for MagicBento
  const featureCards = [
    {
      id: 'issue-credits',
      title: 'Issue Green Credits',
      description: 'Create and issue blockchain-verified green hydrogen credits with complete transparency',
      label: 'Production',
      icon: Leaf,
      gradient: 'linear-gradient(135deg, #10b981, #16a34a)',
      progress: 95,
      trend: 15.2
    },
    {
      id: 'verified-secure',
      title: 'Verified & Secure',
      description: 'All credits are cryptographically secured and verified by regulatory authorities',
      label: 'Security',
      icon: Shield,
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      progress: 99,
      trend: 8.7
    },
    {
      id: 'track-performance',
      title: 'Track Performance',
      description: 'Monitor your credits, transactions, and compliance in real-time with advanced analytics',
      label: 'Analytics',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      progress: 87,
      trend: 12.3
    },
    {
      id: 'connect-stakeholders',
      title: 'Connect Stakeholders',
      description: 'Seamlessly connect producers, buyers, and regulators in one unified platform',
      label: 'Network',
      icon: Users,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      progress: 78,
      trend: 22.1
    },
    {
      id: 'global-marketplace',
      title: 'Global Marketplace',
      description: 'Access a worldwide marketplace for green hydrogen credits with transparent pricing',
      label: 'Trading',
      icon: Globe,
      gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
      progress: 82,
      trend: 18.5
    },
    {
      id: 'prevent-double-counting',
      title: 'Prevent Double-Counting',
      description: 'Blockchain technology ensures each credit is unique and prevents duplication',
      label: 'Integrity',
      icon: Lock,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      progress: 100,
      trend: 0
    }
  ];

  // Keep original features for potential fallback
  const features = [
    {
      icon: Leaf,
      title: 'Issue Green Credits',
      description: 'Create and issue blockchain-verified green hydrogen credits with complete transparency.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Shield,
      title: 'Verified & Secure',
      description: 'All credits are cryptographically secured and verified by regulatory authorities.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor your credits, transactions, and compliance in real-time with advanced analytics.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Users,
      title: 'Connect Stakeholders',
      description: 'Seamlessly connect producers, buyers, and regulators in one unified platform.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Globe,
      title: 'Global Marketplace',
      description: 'Access a worldwide marketplace for green hydrogen credits with transparent pricing.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      icon: Lock,
      title: 'Prevent Double-Counting',
      description: 'Blockchain technology ensures each credit is unique and prevents duplication.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const stats = [
    { value: 15000, label: 'Credits Issued', suffix: '+' },
    { value: 500, label: 'Active Producers', suffix: '+' },
    { value: 98, label: 'Compliance Rate', suffix: '%' },
    { value: 50, label: 'Countries', suffix: '+' }
  ];

  const stakeholders = [
    {
      title: 'Green Hydrogen Producers',
      description: 'Issue and manage verified green hydrogen credits',
      features: ['Issue blockchain credits', 'Track production metrics', 'Submit verification docs', 'Monitor facilities'],
      icon: Leaf,
      color: 'emerald'
    },
    {
      title: 'Industry Buyers',
      description: 'Steel, ammonia, and transport companies purchasing credits',
      features: ['Browse credit marketplace', 'Purchase verified credits', 'Track compliance status', 'Manage credit portfolio'],
      icon: Factory,
      color: 'blue'
    },
    {
      title: 'Certification Bodies',
      description: 'Verify and audit credit authenticity and production',
      features: ['Audit production facilities', 'Verify credit authenticity', 'Prevent fraud/double-counting', 'Generate compliance reports'],
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Regulatory Authorities',
      description: 'Government oversight and policy enforcement',
      features: ['Monitor market compliance', 'Enforce green policies', 'Review audit reports', 'Oversee credit standards'],
      icon: Building,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4 sm:gap-8">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HydroChainLogo size="small" />
              </motion.div>
            </motion.div>
            
            {/* Navigation Links */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 sm:gap-4 flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-all duration-200 text-sm sm:text-base rounded-lg hover:bg-emerald-50"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/signup"
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Blockchain-Powered Certification</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Green Hydrogen
              <span className="block text-emerald-600">Credit System</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A transparent, immutable blockchain platform for issuing, tracking, and certifying 
              green hydrogen credits. Empowering the transition to low-carbon economies through 
              trusted renewable hydrogen verification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold text-lg transition-all duration-200 shadow-xl transform hover:-translate-y-1"
              >
                Join the Platform
                <ArrowRight className="inline w-5 h-5 ml-2" />
              </Link>
              <button className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white font-semibold text-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Challenge We're Solving
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              In the transition to low-carbon economies, it's vital to accurately account for and 
              incentivize the production of truly "green" hydrogen—hydrogen generated from renewable resources.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-red-50 rounded-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lack of Trust</h3>
              <p className="text-gray-600">
                Current systems lack transparency in verifying renewable hydrogen claims, 
                leading to market skepticism and reduced investment.
              </p>
            </div>
            
            <div className="text-center p-8 bg-amber-50 rounded-2xl">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Double Counting</h3>
              <p className="text-gray-600">
                Absence of immutable tracking systems allows for potential fraud 
                and double counting of green hydrogen credits.
              </p>
            </div>
            
            <div className="text-center p-8 bg-blue-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fragmented Market</h3>
              <p className="text-gray-600">
                Multiple stakeholders struggle to coordinate verification, 
                certification, and trading in a unified ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Blockchain-Powered Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HydroChain provides a transparent, immutable platform where every unit of 
              green hydrogen is tracked from production to retirement, ensuring authenticity 
              and preventing fraud.
            </p>
          </div>
          
          {/* Interactive Feature Cards with Magic Bento Effects */}
          <MagicBento 
            cards={featureCards}
            gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            className=""
          />
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for All Stakeholders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform serves the entire green hydrogen ecosystem, from producers to end consumers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {stakeholders.map((stakeholder, index) => {
              const Icon = stakeholder.icon;
              return (
                <div key={index} className="p-8 border border-emerald-100 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 bg-${stakeholder.color}-100 rounded-full flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${stakeholder.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{stakeholder.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {stakeholder.description}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {stakeholder.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Green Hydrogen?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join the blockchain revolution in green hydrogen certification. 
            Build trust, ensure compliance, and accelerate the clean energy transition.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 font-semibold text-lg transition-all duration-200 shadow-xl"
            >
              Get Started Today
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-emerald-600 font-semibold text-lg transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <HydroChainLogo size="medium" className="text-white" />
            </div>
            
            <p className="text-gray-400 mb-8">
              Blockchain-Based Green Hydrogen Credit System
            </p>
            
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} HydroChain. All rights reserved. 
                Building the future of renewable energy certification.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
