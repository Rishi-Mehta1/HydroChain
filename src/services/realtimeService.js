import { supabase } from '../lib/supabaseClient';

class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.isConnected = false;
  }

  /**
   * Initialize realtime connection
   */
  async initialize() {
    try {
      // In Supabase JS v2, status changes are handled at the channel level
      // We'll track connection status through successful channel subscriptions
      console.log('Realtime service initialized');
      this.isConnected = true; // Assume connected if no errors
      return true;
    } catch (error) {
      console.error('Failed to initialize realtime service:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Subscribe to credits updates for current user
   */
  subscribeToUserCredits(userId, callback) {
    const channelName = `user-credits-${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Credits update:', payload);
          this.handleCreditsUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to all available credits (for buyers)
   */
  subscribeToAvailableCredits(callback) {
    const channelName = 'available-credits';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
          filter: 'status=in.(issued,verified)'
        },
        (payload) => {
          console.log('Available credits update:', payload);
          this.handleCreditsUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to transactions for a specific credit
   */
  subscribeToCreditTransactions(creditId, callback) {
    const channelName = `credit-transactions-${creditId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `credit_id=eq.${creditId}`
        },
        (payload) => {
          console.log('Credit transactions update:', payload);
          this.handleTransactionsUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to verification requests for auditors
   */
  subscribeToVerificationRequests(userId, userRole, callback) {
    const channelName = `verification-requests-${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    let filter;
    if (userRole === 'producer') {
      filter = `requester_id=eq.${userId}`;
    } else if (['auditor', 'regulatory', 'verifier'].includes(userRole)) {
      filter = `auditor_id=eq.${userId}`;
    } else {
      // For other roles, subscribe to all requests
      filter = null;
    }

    const channelConfig = {
      event: '*',
      schema: 'public',
      table: 'verification_requests'
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        console.log('Verification requests update:', payload);
        this.handleVerificationRequestsUpdate(payload, callback);
      })
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to market orders
   */
  subscribeToMarketOrders(userId, callback) {
    const channelName = `market-orders-${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_orders',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Market orders update:', payload);
          this.handleMarketOrdersUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to IoT data for a facility
   */
  subscribeToFacilityIoTData(facilityId, callback) {
    const channelName = `facility-iot-${facilityId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iot_data',
          filter: `facility_id=eq.${facilityId}`
        },
        (payload) => {
          console.log('IoT data update:', payload);
          this.handleIoTDataUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to audit trail for compliance monitoring
   */
  subscribeToAuditTrail(callback) {
    const channelName = 'audit-trail';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_trail'
        },
        (payload) => {
          console.log('Audit trail update:', payload);
          this.handleAuditTrailUpdate(payload, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to all relevant updates for a user based on their role
   */
  async subscribeToUserUpdates(callback) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole) {
      throw new Error('User role not found');
    }

    const subscriptions = [];

    // Subscribe based on role
    switch (userRole.role) {
      case 'producer':
        subscriptions.push(this.subscribeToUserCredits(user.id, callback));
        subscriptions.push(this.subscribeToVerificationRequests(user.id, userRole.role, callback));
        break;

      case 'buyer':
        subscriptions.push(this.subscribeToAvailableCredits(callback));
        subscriptions.push(this.subscribeToUserCredits(user.id, callback));
        subscriptions.push(this.subscribeToMarketOrders(user.id, callback));
        break;

      case 'auditor':
        subscriptions.push(this.subscribeToVerificationRequests(user.id, userRole.role, callback));
        break;

      case 'regulatory':
      case 'verifier':
        subscriptions.push(this.subscribeToVerificationRequests(user.id, userRole.role, callback));
        subscriptions.push(this.subscribeToAuditTrail(callback));
        break;

      default:
        console.warn('Unknown user role:', userRole.role);
    }

    return subscriptions;
  }

  /**
   * Handle credits updates
   */
  handleCreditsUpdate(payload, callback) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    callback({
      type: 'credits',
      action: eventType.toLowerCase(),
      data: newRecord || oldRecord,
      previousData: oldRecord
    });
  }

  /**
   * Handle transactions updates
   */
  handleTransactionsUpdate(payload, callback) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    callback({
      type: 'transactions',
      action: eventType.toLowerCase(),
      data: newRecord || oldRecord,
      previousData: oldRecord
    });
  }

  /**
   * Handle verification requests updates
   */
  handleVerificationRequestsUpdate(payload, callback) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    callback({
      type: 'verification_requests',
      action: eventType.toLowerCase(),
      data: newRecord || oldRecord,
      previousData: oldRecord
    });
  }

  /**
   * Handle market orders updates
   */
  handleMarketOrdersUpdate(payload, callback) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    callback({
      type: 'market_orders',
      action: eventType.toLowerCase(),
      data: newRecord || oldRecord,
      previousData: oldRecord
    });
  }

  /**
   * Handle IoT data updates
   */
  handleIoTDataUpdate(payload, callback) {
    const { eventType, new: newRecord } = payload;
    
    callback({
      type: 'iot_data',
      action: eventType.toLowerCase(),
      data: newRecord
    });
  }

  /**
   * Handle audit trail updates
   */
  handleAuditTrailUpdate(payload, callback) {
    const { eventType, new: newRecord } = payload;
    
    callback({
      type: 'audit_trail',
      action: eventType.toLowerCase(),
      data: newRecord
    });
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    for (const [channelName, subscription] of this.subscriptions) {
      supabase.removeChannel(subscription);
      console.log(`Unsubscribed from ${channelName}`);
    }
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Broadcast a message to a specific channel (for admin notifications)
   */
  async broadcastMessage(channel, message) {
    try {
      const { error } = await supabase
        .channel(channel)
        .send({
          type: 'broadcast',
          event: 'message',
          payload: message
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return false;
    }
  }
}

export default new RealtimeService();
