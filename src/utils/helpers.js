// Utility functions for Green Hydrogen Credit System

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    retired: 'text-gray-600 bg-gray-100',
    completed: 'text-emerald-600 bg-emerald-100',
    failed: 'text-red-600 bg-red-100',
    operational: 'text-green-600 bg-green-100',
    maintenance: 'text-orange-600 bg-orange-100',
    approved: 'text-green-600 bg-green-100',
    reviewed: 'text-emerald-600 bg-emerald-100',
    resolved: 'text-purple-600 bg-purple-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const getRiskLevelColor = (level) => {
  const colors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };
  return colors[level] || 'text-gray-600 bg-gray-100';
};

export const getTransactionTypeIcon = (type) => {
  const icons = {
    issue: '🎯',
    transfer: '🔄',
    retire: '🏁',
    verification: '✅',
  };
  return icons[type] || '📋';
};

export const truncateHash = (hash, length = 8) => {
  if (!hash) return '';
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
};

export const calculateCO2Impact = (credits) => {
  // Average CO2 reduction per credit (in tons)
  const avgCO2PerCredit = 0.85;
  return (credits * avgCO2PerCredit).toFixed(2);
};

export const generateTransactionId = () => {
  return 'TX' + Date.now().toString(36).toUpperCase();
};

export const generateCreditId = () => {
  return 'CR' + Date.now().toString(36).toUpperCase();
};

export const validateCreditForm = (formData) => {
  const errors = {};
  
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  if (!formData.productionMethod) {
    errors.productionMethod = 'Production method is required';
  }
  
  if (!formData.certificationBody) {
    errors.certificationBody = 'Certification body is required';
  }
  
  if (!formData.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  }
  
  const today = new Date();
  const expiry = new Date(formData.expiryDate);
  if (expiry <= today) {
    errors.expiryDate = 'Expiry date must be in the future';
  }
  
  return errors;
};

export const sortByDate = (a, b, key = 'date') => {
  return new Date(b[key]) - new Date(a[key]);
};

export const filterByDateRange = (items, startDate, endDate, dateKey = 'date') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateKey]);
    return itemDate >= start && itemDate <= end;
  });
};

export const groupByMonth = (transactions) => {
  const grouped = {};
  
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(tx);
  });
  
  return grouped;
};

export const calculateCompliancePercentage = (owned, required) => {
  if (required === 0) return 100;
  return Math.min(100, Math.round((owned / required) * 100));
};

export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
