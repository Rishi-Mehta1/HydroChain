import { supabase } from '../lib/supabaseClient';
import blockchainService from './blockchainService';

class CreditsService {
  /**
   * Issue new credits (calls edge function)
   */
  async issueCredits(creditData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('issue-credit', {
        body: {
          facilityId: creditData.facilityId,
          volume: creditData.volume,
          productionMethod: creditData.productionMethod,
          renewableSource: creditData.renewableSource,
          verificationData: creditData.verificationData
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error issuing credits:', error);
      throw error;
    }
  }

  /**
   * Transfer credits to another user (calls edge function)
   */
  async transferCredits(transferData) {
    try {
      const response = await supabase.functions.invoke('transfer-credit', {
        body: {
          creditId: transferData.creditId,
          toUserId: transferData.toUserId,
          volume: transferData.volume,
          price: transferData.price
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error transferring credits:', error);
      throw error;
    }
  }

  /**
   * Retire credits (calls edge function)
   */
  async retireCredits(retirementData) {
    try {
      const response = await supabase.functions.invoke('retire-credit', {
        body: {
          creditId: retirementData.creditId,
          volume: retirementData.volume,
          retirementReason: retirementData.retirementReason,
          complianceProject: retirementData.complianceProject,
          beneficiary: retirementData.beneficiary
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error retiring credits:', error);
      throw error;
    }
  }

  /**
   * Get credits owned by current user
   */
  async getUserCredits() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('credits')
        .select(`
          *,
          production_facilities (
            id,
            name,
            location,
            capacity_mw,
            renewable_sources
          ),
          transactions (
            id,
            transaction_type,
            volume,
            blockchain_tx_hash,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }

  /**
   * Get available credits for purchase (for buyers)
   */
  async getAvailableCredits(filters = {}) {
    try {
      let query = supabase
        .from('credits')
        .select(`
          *,
          production_facilities (
            id,
            name,
            location,
            capacity_mw,
            renewable_sources
          )
        `)
        .in('status', ['issued', 'verified']);

      // Apply filters
      if (filters.renewableSource) {
        query = query.eq('renewable_source', filters.renewableSource);
      }

      if (filters.productionMethod) {
        query = query.eq('production_method', filters.productionMethod);
      }

      if (filters.minVolume) {
        query = query.gte('volume', filters.minVolume);
      }

      if (filters.maxVolume) {
        query = query.lte('volume', filters.maxVolume);
      }

      if (filters.location) {
        query = query.ilike('production_facilities.location', `%${filters.location}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available credits:', error);
      throw error;
    }
  }

  /**
   * Get credit details by ID
   */
  async getCreditById(creditId) {
    try {
      const { data, error } = await supabase
        .from('credits')
        .select(`
          *,
          production_facilities (
            id,
            name,
            location,
            capacity_mw,
            renewable_sources,
            certification_status,
            certifying_body
          ),
          transactions (
            id,
            transaction_type,
            volume,
            from_user_id,
            to_user_id,
            price_per_unit,
            total_amount,
            blockchain_tx_hash,
            created_at
          )
        `)
        .eq('id', creditId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching credit details:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific credit
   */
  async getCreditTransactions(creditId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          from_user:from_user_id(id, email),
          to_user:to_user_id(id, email)
        `)
        .eq('credit_id', creditId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }
  }

  /**
   * Get user's production facilities
   */
  async getUserFacilities() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('production_facilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user facilities:', error);
      throw error;
    }
  }

  /**
   * Create a new production facility
   */
  async createFacility(facilityData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('production_facilities')
        .insert({
          user_id: user.id,
          name: facilityData.name,
          location: facilityData.location,
          capacity_mw: facilityData.capacityMW,
          renewable_sources: facilityData.renewableSources,
          operational_since: facilityData.operationalSince,
          metadata: facilityData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  }

  /**
   * Submit IoT data for a facility
   */
  async submitIoTData(facilityId, iotData) {
    try {
      const { data, error } = await supabase
        .from('iot_data')
        .insert({
          facility_id: facilityId,
          device_id: iotData.deviceId,
          data_type: iotData.dataType,
          value: iotData.value,
          unit: iotData.unit,
          quality_score: iotData.qualityScore || 1.0,
          timestamp: iotData.timestamp || new Date().toISOString(),
          metadata: iotData.metadata || {}
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error submitting IoT data:', error);
      throw error;
    }
  }

  /**
   * Get IoT data for a facility
   */
  async getFacilityIoTData(facilityId, filters = {}) {
    try {
      let query = supabase
        .from('iot_data')
        .select('*')
        .eq('facility_id', facilityId);

      // Apply filters
      if (filters.dataType) {
        query = query.eq('data_type', filters.dataType);
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(filters.limit || 100);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching IoT data:', error);
      throw error;
    }
  }

  /**
   * Create verification request
   */
  async createVerificationRequest(requestData) {
    try {
      const response = await supabase.functions.invoke('verify-production', {
        body: {
          action: 'create_request',
          creditId: requestData.creditId,
          requestType: requestData.requestType,
          priority: requestData.priority,
          documents: requestData.documents,
          verificationData: requestData.verificationData
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating verification request:', error);
      throw error;
    }
  }

  /**
   * Get verification requests
   */
  async getVerificationRequests(filters = {}) {
    try {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          credits (
            id,
            token_id,
            volume,
            production_method,
            renewable_source
          ),
          requester:requester_id(id, email),
          auditor:auditor_id(id, email)
        `);

      // Apply filters based on user role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRole?.role === 'producer') {
        query = query.eq('requester_id', user.id);
      } else if (userRole?.role === 'auditor') {
        query = query.or(`auditor_id.eq.${user.id},status.eq.pending`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      throw error;
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats() {
    try {
      // Get total credits issued
      const { count: totalCredits } = await supabase
        .from('credits')
        .select('*', { count: 'exact', head: true });

      // Get total volume
      const { data: volumeData } = await supabase
        .from('credits')
        .select('volume');

      const totalVolume = volumeData?.reduce((sum, credit) => sum + parseFloat(credit.volume || 0), 0) || 0;

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          *,
          credits (id, volume, production_method, renewable_source)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get price data from recent transactions with prices
      const { data: priceData } = await supabase
        .from('transactions')
        .select('price_per_unit, created_at')
        .not('price_per_unit', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      const averagePrice = priceData?.length > 0 
        ? priceData.reduce((sum, tx) => sum + parseFloat(tx.price_per_unit || 0), 0) / priceData.length 
        : 0;

      return {
        totalCredits: totalCredits || 0,
        totalVolume: Math.round(totalVolume * 100) / 100,
        averagePrice: Math.round(averagePrice * 100) / 100,
        recentTransactions: recentTransactions || [],
        priceHistory: priceData || []
      };
    } catch (error) {
      console.error('Error fetching market stats:', error);
      throw error;
    }
  }

  /**
   * Search credits with advanced filters
   */
  async searchCredits(searchParams) {
    try {
      let query = supabase
        .from('credits')
        .select(`
          *,
          production_facilities (
            id,
            name,
            location,
            capacity_mw,
            renewable_sources,
            certification_status
          )
        `);

      // Apply search filters
      if (searchParams.tokenId) {
        query = query.eq('token_id', searchParams.tokenId);
      }

      if (searchParams.producer) {
        query = query.eq('user_id', searchParams.producer);
      }

      if (searchParams.status && searchParams.status.length > 0) {
        query = query.in('status', searchParams.status);
      }

      if (searchParams.renewableSources && searchParams.renewableSources.length > 0) {
        query = query.in('renewable_source', searchParams.renewableSources);
      }

      if (searchParams.productionMethods && searchParams.productionMethods.length > 0) {
        query = query.in('production_method', searchParams.productionMethods);
      }

      if (searchParams.minVolume) {
        query = query.gte('volume', searchParams.minVolume);
      }

      if (searchParams.maxVolume) {
        query = query.lte('volume', searchParams.maxVolume);
      }

      if (searchParams.startDate) {
        query = query.gte('created_at', searchParams.startDate);
      }

      if (searchParams.endDate) {
        query = query.lte('created_at', searchParams.endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(searchParams.limit || 50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching credits:', error);
      throw error;
    }
  }
}

export default new CreditsService();
