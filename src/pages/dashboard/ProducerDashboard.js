import React from 'react';

const ProducerDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Producer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Production Overview</h2>
          <p className="text-gray-600">Monitor your hydrogen production</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Order Management</h2>
          <p className="text-gray-600">Handle incoming orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Quality Control</h2>
          <p className="text-gray-600">Ensure product quality</p>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
