// AI Automation Service for Credit Lifecycle Events
class AiAutomationService {
  constructor() {
    this.webhookUrl = "https://kaival1051.app.n8n.cloud/webhook-test/f48a7ede-656d-47c3-bd05-336fb397d0d4";
  }

  /**
   * Send event notification to AI automation webhook
   */
  async sendEventNotification(eventData) {
    try {
      console.log('🤖 Sending AI automation notification:', eventData);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        console.log('✅ AI automation notification sent successfully');
        const responseData = await response.json().catch(() => ({}));
        return { success: true, response: responseData };
      } else {
        console.warn('⚠️ AI automation notification failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ AI automation notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify credit issuance/production
   */
  async notifyCreditIssued(credit, producerInfo) {
    const eventData = {
      EventType: "Credit Issue",
      producer: producerInfo.email || "producer@example.com",
      producer_name: producerInfo.name || "Green Hydrogen Producer",
      isMockData: true,
      description: `Green Hydrogen Credit produced - ${credit.volume} kg H₂`,
      creditAmount: parseFloat(credit.volume) || 0
    };

    return await this.sendEventNotification(eventData);
  }

  /**
   * Notify credit purchase
   */
  async notifyCreditPurchased(credit, buyerInfo, sellerInfo) {
    const eventData = {
      EventType: "credit_purchased",
      producer: sellerInfo.email || "seller@example.com",
      producer_name: sellerInfo.name || "Credit Seller",
      isMockData: true,
      description: `Green Hydrogen Credit purchased - ${credit.volume} kg H₂`,
      creditAmount: parseFloat(credit.volume) || 0
    };

    return await this.sendEventNotification(eventData);
  }

  /**
   * Notify credit retirement
   */
  async notifyCreditRetired(credit, ownerInfo, retirementReason) {
    const eventData = {
      EventType: "credit_retired",
      producer: ownerInfo.email || "owner@example.com",
      producer_name: ownerInfo.name || "Credit Owner",
      isMockData: true,
      description: `Green Hydrogen Credit retired - ${credit.volume} kg H₂. Reason: ${retirementReason || 'Voluntary retirement'}`,
      creditAmount: parseFloat(credit.volume) || 0
    };

    return await this.sendEventNotification(eventData);
  }

  /**
   * Get user information from authenticated user
   */
  async getUserInfo(user, supabaseClient) {
    try {
      // Use the actual authenticated user's information
      return {
        id: user.id,
        email: user.email || `user_${user.id.slice(0, 8)}@hydrochain.com`,
        name: user.user_metadata?.name || user.user_metadata?.full_name || `User ${user.id.slice(0, 8)}`,
      };
    } catch (error) {
      console.warn('Could not fetch user info:', error.message);
      return {
        id: user.id,
        email: user.email || `user_${user.id.slice(0, 8)}@hydrochain.com`,
        name: user.user_metadata?.name || user.user_metadata?.full_name || `User ${user.id.slice(0, 8)}`
      };
    }
  }
}

export default new AiAutomationService();
