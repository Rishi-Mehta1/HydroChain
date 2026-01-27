import { supabase } from "../lib/supabaseClient";
import aiAutomationService from "./aiAutomationService";
import pdfService from "./pdfService";

class AuditService {
  /**
   * Submit audit decision for a credit
   */
  async submitAuditDecision(creditId, decision, notes, auditorInfo) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Submitting audit decision...", {
        creditId,
        decision,
        notes: notes?.substring(0, 50) + "...",
      });

      // Get credit details first
      const { data: credit, error: creditError } = await supabase
        .from("credits")
        .select("*")
        .eq("id", creditId)
        .single();

      if (creditError || !credit) {
        throw new Error("Credit not found");
      }

      // Check if credit is already verified (check metadata since status remains 'issued')
      if (
        credit.metadata?.isVerified === true ||
        credit.metadata?.verificationStatus === "verified"
      ) {
        throw new Error("Credit is already verified");
      }

      // Update credit status based on audit decision
      let newStatus = credit.status;
      let updateData = {
        updated_at: new Date().toISOString(),
      };

      if (decision === "approved") {
        newStatus = "issued"; // Keep original status, track verification in metadata
        updateData = {
          ...updateData,
          metadata: {
            ...credit.metadata,
            auditDecision: decision,
            auditNotes: notes,
            auditedBy: user.id,
            auditedAt: new Date().toISOString(),
            verificationStatus: "verified",
            certificationBody: "Third-party auditor",
            verificationDate: new Date().toISOString(),
            isVerified: true, // Clear flag for easy filtering
          },
        };
      } else if (decision === "rejected") {
        updateData = {
          ...updateData,
          metadata: {
            ...credit.metadata,
            auditDecision: decision,
            auditNotes: notes,
            auditedBy: user.id,
            auditedAt: new Date().toISOString(),
            verificationStatus: "rejected",
          },
        };
      } else if (decision === "needs_review") {
        updateData = {
          ...updateData,
          metadata: {
            ...credit.metadata,
            auditDecision: decision,
            auditNotes: notes,
            auditedBy: user.id,
            auditedAt: new Date().toISOString(),
            verificationStatus: "needs_review",
          },
        };
      }

      // Update the credit
      const { data: updatedCredit, error: updateError } = await supabase
        .from("credits")
        .update(updateData)
        .eq("id", creditId)
        .select("*")
        .single();

      if (updateError) {
        console.error(" Credit update failed:", updateError);
        throw new Error(`Failed to update credit: ${updateError.message}`);
      }

      // Record audit transaction (using 'transfer' type as audit is not allowed in schema)
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          credit_id: creditId,
          from_user: null,
          to_user: credit.user_id,
          type: "transfer",
          volume: parseFloat(credit.volume),
          tx_hash: `audit_${Date.now()}`,
        });

      if (transactionError) {
        console.warn(" Audit transaction recording failed:", transactionError);
      } else {
        console.log("Audit transaction recorded successfully");
      }

      // Generate PDF certificate for audit completion (for approved audits)
      let certificateUrl = null;
      if (decision === "approved") {
        try {
          console.log("Generating audit certificate...");
          const auditorInfo = await aiAutomationService.getUserInfo(
            user,
            supabase,
          );

          const pdfResult = await pdfService.generateAndUploadAuditCertificate(
            updatedCredit,
            auditorInfo,
            {
              decision,
              status: "VERIFIED",
              complianceScore: "EXCELLENT",
              notes,
            },
          );

          certificateUrl = pdfResult.url;
          console.log(" Audit certificate generated:", certificateUrl);
        } catch (pdfError) {
          console.warn(" PDF certificate generation failed:", pdfError.message);
        }
      }

      // Send AI automation notification for audit completion
      try {
        const auditorInfo = await aiAutomationService.getUserInfo(
          user,
          supabase,
        );

        await aiAutomationService.notifyCreditAudited(
          updatedCredit,
          auditorInfo,
          decision,
          notes,
        );
        console.log("AI automation notification sent for audit completion");
      } catch (notificationError) {
        console.log(
          "AI automation notification failed:",
          notificationError.message,
        );
      }

      return {
        success: true,
        credit: updatedCredit,
        auditResult: {
          decision,
          notes,
          auditedBy: user.id,
          auditedAt: new Date().toISOString(),
          creditId,
          newStatus,
          certificateUrl,
        },
        message: `Credit audit completed successfully. Status: ${
          decision === "approved" ? "VERIFIED" : decision.toUpperCase()
        }`,
        certificateUrl,
      };
    } catch (error) {
      console.error("Audit submission failed:", error);
      throw error;
    }
  }

  /**
   * Get credits pending verification (for auditor dashboard)
   */
  async getCreditsForVerification() {
    try {
      const { data, error } = await supabase
        .from("credits")
        .select(
          `
          id,
          user_id,
          token_id,
          volume,
          status,
          metadata,
          blockchain_tx_hash,
          created_at,
          updated_at,
          transactions (
            id,
            type,
            volume,
            tx_hash,
            created_at
          )
        `,
        )
        .in("status", ["issued", "owned"]) // Only show non-verified credits
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching credits for verification:", error);
      throw error;
    }
  }

  /**
   * Get audit history for a specific credit
   */
  async getCreditAuditHistory(creditId) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          id,
          type,
          created_at,
          tx_hash
        `,
        )
        .eq("credit_id", creditId)
        .eq("type", "transfer")
        .like("tx_hash", "audit_%")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching audit history:", error);
      throw error;
    }
  }

  /**
   * Get auditor statistics
   */
  async getAuditorStats() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get audit transactions (using tx_hash pattern since no metadata column)
      const { data: auditTransactions, error: auditError } = await supabase
        .from("transactions")
        .select("id, created_at, tx_hash, credit_id")
        .eq("type", "transfer")
        .like("tx_hash", "audit_%");

      if (auditError) {
        console.warn("Could not fetch audit stats:", auditError);
        return {
          totalAudits: 0,
          approvedAudits: 0,
          rejectedAudits: 0,
          needsReviewAudits: 0,
          approvalRate: 0,
        };
      }

      // Get credits that were audited to check their verification status
      const auditedCreditIds =
        auditTransactions?.map((tx) => tx.credit_id) || [];
      let verifiedAudits = 0;

      if (auditedCreditIds.length > 0) {
        const { data: auditedCredits } = await supabase
          .from("credits")
          .select("status, metadata")
          .in("id", auditedCreditIds);

        verifiedAudits =
          auditedCredits?.filter(
            (credit) =>
              credit.metadata?.isVerified === true &&
              credit.metadata?.auditedBy === user.id,
          ).length || 0;
      }

      const totalAudits = auditTransactions?.length || 0;

      return {
        totalAudits,
        approvedAudits: verifiedAudits,
        rejectedAudits: totalAudits - verifiedAudits,
        needsReviewAudits: 0,
        approvalRate:
          totalAudits > 0
            ? Math.round((verifiedAudits / totalAudits) * 100)
            : 0,
      };
    } catch (error) {
      console.error("Error fetching auditor stats:", error);
      return {
        totalAudits: 0,
        approvedAudits: 0,
        rejectedAudits: 0,
        needsReviewAudits: 0,
        approvalRate: 0,
      };
    }
  }
}

export default new AuditService();
