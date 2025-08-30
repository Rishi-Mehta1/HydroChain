import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, TrendingUp, Package, Activity, Plus, 
  CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import CreditIssueForm from '../components/forms/CreditIssueForm';
import { 
  credits, transactions, producerChartData, 
  creditStatusData, transactionHistoryData, productionFacilities 
} from '../data/mockData';
import { formatNumber, formatCurrency, formatDate, getStatusColor } from '../utils/helpers';

const ProducerDashboard = () => {
  const [showIssueForm, setShowIssueForm] = useState(false);

  const statsCards = [
    {
      title: 'Total Credits Issued',
      value: '15,000',
      change: '+12%',
      icon: Leaf,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Active Credits',
      value: '7,300',
      change: '+5%',
      icon: Activity,
      color: 'bg-emerald-500',
      trend: 'up'
    },
    {
      title: 'Pending Verification',
      value: '500',
      change: '-2%',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'down'
    },
    {
      title: 'Total Revenue',
      value: '$682,500',
      change: '+18%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Producer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your green hydrogen credit production
          </p>
        </div>
        <button
          onClick={() => setShowIssueForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Issue New Credits</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-2 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          data={producerChartData} 
          dataKey="credits" 
          title="Monthly Credit Production"
          color="#22c55e"
        />
        <PieChart 
          data={creditStatusData} 
          title="Credit Status Distribution"
        />
      </motion.div>

      {/* Production Facilities */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Production Facilities
          </h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productionFacilities.map((facility) => (
            <motion.div
              key={facility.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {facility.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {facility.location}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(facility.status)}`}>
                  {facility.status}
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="font-medium text-gray-900 dark:text-white">{facility.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Efficiency</span>
                  <span className="font-medium text-gray-900 dark:text-white">{facility.efficiency}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Daily Production</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {facility.dailyProduction} credits
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${facility.efficiency}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-green-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {tx.id}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatNumber(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Credit Issue Form Modal */}
      <CreditIssueForm 
        isOpen={showIssueForm} 
        onClose={() => setShowIssueForm(false)} 
      />
    </motion.div>
  );
};

export default ProducerDashboard;
