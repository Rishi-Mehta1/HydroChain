import React from 'react';

const BuyerDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buyer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Available Hydrogen</h2>
          <p className="text-gray-600">View and purchase hydrogen from producers</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">My Orders</h2>
          <p className="text-gray-600">Track your hydrogen orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Sustainability Report</h2>
          <p className="text-gray-600">View your environmental impact</p>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
