import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { debugAuth } from '../../utils/debugAuth';

const AuthDebug = ({ onClose }) => {
  const [debugResults, setDebugResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { clearAuthState } = useAuth();

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await debugAuth.runDiagnostics();
      setDebugResults(results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDebugResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearAndReload = () => {
    debugAuth.clearAllAuthData();
    clearAuthState();
    window.location.reload();
  };

  const handleForceLogin = () => {
    clearAuthState();
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Authentication Debug</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Use these tools to troubleshoot authentication issues.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Diagnostics'}
              </button>
              
              <button
                onClick={handleForceLogin}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Force Show Login Form
              </button>
              
              <button
                onClick={handleClearAndReload}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear All Data & Reload
              </button>
            </div>
            
            {debugResults && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Diagnostic Results:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(debugResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
