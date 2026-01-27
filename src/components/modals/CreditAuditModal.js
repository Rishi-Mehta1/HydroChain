import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  FileCheck,
  Eye,
  Calendar,
  Zap,
  Award,
  User,
  Clock,
  Hash,
  Loader,
} from "lucide-react";
import CreditService from "../../services/CreditService";
import auditService from "../../services/auditService";

const CreditAuditModal = ({ isOpen, onClose, creditId, onAuditComplete }) => {
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditNotes, setAuditNotes] = useState("");
  const [auditDecision, setAuditDecision] = useState("approved"); // 'approved' | 'rejected' | 'needs_review'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCreditDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const creditData = await CreditService.getCreditById(creditId);
      setCredit(creditData);
    } catch (err) {
      console.error("Error fetching credit details:", err);
      setError("Failed to load credit details");
    } finally {
      setLoading(false);
    }
  }, [creditId]);

  useEffect(() => {
    if (isOpen && creditId) {
      fetchCreditDetails();
    }
  }, [isOpen, creditId, fetchCreditDetails]);

  const handleAuditSubmit = async () => {
    if (!auditNotes.trim()) {
      setError("Please provide audit notes");
      return;
    }

    if (auditNotes.trim().length < 10) {
      setError("Audit notes must be at least 10 characters long");
      return;
    }

    try {
      setAuditing(true);
      setError(null);

      console.log("🔍 Submitting real audit for credit:", creditId);

      // Call the real audit service
      const result = await auditService.submitAuditDecision(
        creditId,
        auditDecision,
        auditNotes.trim(),
      );

      console.log("✅ Audit completed successfully:", result);

      // Show success message with certificate link
      if (result.certificateUrl) {
        setSuccess({
          message: "Audit completed successfully!",
          decision: auditDecision,
          certificateUrl: result.certificateUrl,
        });

        // Don't auto-close if we have a certificate to show
        setTimeout(() => {
          setSuccess(null);
          handleClose();
        }, 5000);
      } else {
        // Refresh credit data to show updated status
        await fetchCreditDetails();

        // Show success message briefly before closing
        setTimeout(() => {
          handleClose();
        }, 1500);
      }

      if (onAuditComplete) {
        onAuditComplete(result.auditResult);
      }
    } catch (err) {
      console.error("❌ Error completing audit:", err);
      setError(err.message || "Failed to complete audit. Please try again.");
    } finally {
      setAuditing(false);
    }
  };

  const handleClose = () => {
    if (auditing) return;
    setCredit(null);
    setAuditNotes("");
    setAuditDecision("approved");
    setError(null);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "bg-green-100 text-green-800 border-green-200";
      case "transferred":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "retired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Credit Audit
                </h2>
                <p className="text-sm text-gray-600">
                  Review and audit credit for compliance
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={auditing}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Audit Completed Successfully!
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Credit has been{" "}
                  {success.decision === "approved"
                    ? "verified and approved"
                    : success.decision}{" "}
                  by the audit process.
                </p>

                {success.certificateUrl && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">
                      Audit Certificate Available
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Official audit certificate has been generated and is ready
                      for download.
                    </p>
                    <a
                      href={success.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Download Audit Certificate
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading credit details...</p>
              </div>
            </div>
          ) : error && !credit ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchCreditDetails}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : credit ? (
            <div className="space-y-6">
              {/* Credit Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Credit Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Credit ID:</span>
                      <span className="font-mono text-gray-800">
                        #{credit.token_id || credit.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Volume:</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-green-600" />
                        {credit.volume} MWh
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          credit.status,
                        )}`}
                      >
                        {credit.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(credit.created_at)}
                      </span>
                    </div>
                    {credit.updated_at &&
                      credit.updated_at !== credit.created_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-gray-800 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(credit.updated_at)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-600" />
                    Blockchain Details
                  </h3>
                  <div className="space-y-4">
                    {credit.blockchain_tx_hash ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Network:</span>
                          <span className="font-medium text-blue-600">
                            Sepolia Testnet
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Transaction Hash:
                          </span>
                          <code className="bg-white px-3 py-2 rounded-lg border text-sm font-mono">
                            {credit.blockchain_tx_hash.slice(0, 8)}...
                            {credit.blockchain_tx_hash.slice(-8)}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Verification:</span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Blockchain Verified
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-amber-600 font-medium">
                          Off-chain Credit
                        </p>
                        <p className="text-sm text-gray-600">
                          No blockchain transaction found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              {credit.transactions && credit.transactions.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-gray-600" />
                    Transaction History
                  </h3>
                  <div className="space-y-3">
                    {credit.transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "issue"
                                  ? "bg-green-100"
                                  : transaction.type === "transfer"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {transaction.type === "issue" ? (
                                <Zap className="w-4 h-4 text-green-600" />
                              ) : transaction.type === "transfer" ? (
                                <User className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Shield className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 capitalize">
                                {transaction.type}
                              </p>
                              <p className="text-sm text-gray-600">
                                Volume: {transaction.volume} MWh
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {formatDate(transaction.created_at)}
                            </p>
                            {transaction.tx_hash && (
                              <span className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Hash className="w-3 h-3" />
                                {transaction.tx_hash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Form */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Audit Review
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audit Decision *
                    </label>
                    <select
                      value={auditDecision}
                      onChange={(e) => setAuditDecision(e.target.value)}
                      disabled={auditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                    >
                      <option value="approved">
                        ✅ Approved - Credit meets all compliance requirements
                      </option>
                      <option value="needs_review">
                        ⚠️ Needs Review - Additional verification required
                      </option>
                      <option value="rejected">
                        ❌ Rejected - Does not meet compliance standards
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audit Notes *
                    </label>
                    <textarea
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      disabled={auditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                      rows="4"
                      placeholder="Provide detailed audit notes, compliance checks performed, and any recommendations..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 characters required for audit documentation
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  disabled={auditing}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuditSubmit}
                  disabled={
                    auditing ||
                    !auditNotes.trim() ||
                    auditNotes.trim().length < 10
                  }
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {auditing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Completing Audit...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Complete Audit
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreditAuditModal;
