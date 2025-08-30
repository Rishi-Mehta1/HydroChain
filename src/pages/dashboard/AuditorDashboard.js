import React from 'react';

const AuditorDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Auditor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Audit Tracking</h2>
          <p className="text-gray-600">Monitor audit progress and compliance</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Compliance Reports</h2>
          <p className="text-gray-600">View compliance metrics and reports</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Risk Assessment</h2>
          <p className="text-gray-600">Assess and manage risks</p>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
