// AI Automation Service for Credit Lifecycle Events
class AiAutomationService {
  constructor() {
    this.webhookUrl =
      "https://kaival1051.app.n8n.cloud/webhook-test/f48a7ede-656d-47c3-bd05-336fb397d0d4";
  }

  /**
   * Send event notification to AI automation webhook
   */
  async sendEventNotification(eventData) {
    try {
      console.log("Sending AI automation notification:", eventData);

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        console.log("AI automation notification sent successfully");
        const responseData = await response.json().catch(() => ({}));
        return { success: true, response: responseData };
      } else {
        console.warn(
          "AI automation notification failed:",
          response.status,
          response.statusText,
        );
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error("AI automation notification error:", error);
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
      creditAmount: parseFloat(credit.volume) || 0,
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
      creditAmount: parseFloat(credit.volume) || 0,
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
      description: `Green Hydrogen Credit retired - ${
        credit.volume
      } kg H₂. Reason: ${retirementReason || "Voluntary retirement"}`,
      creditAmount: parseFloat(credit.volume) || 0,
    };

    return await this.sendEventNotification(eventData);
  }

  /**
   * Notify credit audit completion
   */
  async notifyCreditAudited(credit, auditorInfo, auditDecision, auditNotes) {
    const eventData = {
      EventType: "credit_audited",
      producer: auditorInfo.email || "auditor@example.com",
      producer_name: auditorInfo.name || "Credit Auditor",
      isMockData: true,
      description: `Green Hydrogen Credit audited - ${
        credit.volume
      } kg H₂. Decision: ${auditDecision}. Notes: ${
        auditNotes?.substring(0, 100) || "No notes provided"
      }`,
      creditAmount: parseFloat(credit.volume) || 0,
      auditDecision: auditDecision,
      creditStatus: credit.status,
    };

    return await this.sendEventNotification(eventData);
  }

  /**
   * Get user information from authenticated user with real email
   */
  async getUserInfo(user, supabaseClient) {
    try {
      // Always use the actual authenticated user's email
      if (!user) {
        throw new Error("No user provided");
      }

      console.log("Fetching user info for:", user.id, "Email:", user.email);

      // The user object from Supabase auth should always have the real email
      const userInfo = {
        id: user.id,
        email: user.email, // This is the actual logged-in user's email
        name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "HydroChain User",
      };

      // If for some reason the user doesn't have an email, throw an error
      if (!userInfo.email) {
        throw new Error("User email not available from authentication");
      }

      console.log("User info retrieved:", {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      });
      return userInfo;
    } catch (error) {
      console.error("Error fetching user info:", error.message);
      // Only use fallback if there's truly no email available
      if (user?.email) {
        return {
          id: user.id,
          email: user.email,
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "HydroChain User",
        };
      } else {
        throw new Error("Cannot send notification: User email not available");
      }
    }
  }
}

export default new AiAutomationService();
