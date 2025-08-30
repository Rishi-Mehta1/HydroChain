import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ExternalLink, 
  Coins, 
  Zap, 
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import freeBlockchainService from '../services/freeBlockchainService';

const NetworkSelector = ({ onNetworkChange, className = '' }) => {
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load available networks
    const availableNetworks = freeBlockchainService.getAvailableNetworks();
    setNetworks(availableNetworks);
    setSelectedNetwork('mumbai'); // Default to Mumbai
  }, []);

  const handleNetworkSwitch = async (networkKey) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log(`🔄 Switching to ${networkKey}...`);
      const network = await freeBlockchainService.switchNetwork(networkKey);
      
      setSelectedNetwork(networkKey);
      setConnectionStatus('connected');
      
      // Notify parent component
      if (onNetworkChange) {
        onNetworkChange(network);
      }
      
      console.log('✅ Network switched successfully');
      
    } catch (error) {
      console.error('❌ Network switch failed:', error);
      setError(error.message);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRequestTokens = async (network) => {
    try {
      const success = await freeBlockchainService.requestFreeTokens(network.key);
      if (success) {
        alert('🎉 Free tokens requested successfully!');
      } else {
        window.open(network.faucetUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to request tokens:', error);
      window.open(network.faucetUrl, '_blank');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Free Blockchain Networks
          <Badge variant="secondary" className="ml-auto">
            100% FREE
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a free testnet for zero-cost blockchain transactions
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Network</label>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a free blockchain network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.key} value={network.key}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{network.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {network.currency}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Network Details */}
        {selectedNetwork && (
          <div className="border rounded-lg p-4 bg-muted/30">
            {(() => {
              const network = networks.find(n => n.key === selectedNetwork);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{network.name}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon()}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {network.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span>Currency: {network.currency}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestTokens(network)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Get Free Tokens
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Connection Button */}
        <Button 
          onClick={() => handleNetworkSwitch(selectedNetwork)}
          disabled={!selectedNetwork || isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Connect to {networks.find(n => n.key === selectedNetwork)?.name || 'Network'}
            </>
          )}
        </Button>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {connectionStatus === 'connected' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Connected successfully! You can now create FREE blockchain transactions.
            </AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>💡 <strong>Why these networks are FREE:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>These are testnets designed for development and testing</li>
            <li>Gas fees are either free or extremely cheap (fractions of a cent)</li>
            <li>Tokens can be obtained for free from faucets</li>
            <li>All transactions are real and visible on block explorers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkSelector;
