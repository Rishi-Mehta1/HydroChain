import { jsPDF } from "jspdf";

class PDFService {
  constructor() {
    // No config needed for local generation
  }

  /**
   * Add watermark to PDF
   */
  addWatermark(doc) {
    const totalPages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Save current state
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(40);
      doc.setFont(undefined, "bold");

      // Add diagonal watermark
      // We need to use a transformation matrix for rotation in jsPDF
      // or use the newer API if available, but simple text rotation acts weird sometimes.
      // Let's use specific angle if supported or just center text.

      try {
        doc.text("HydroChain Certified", pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 45,
          renderingMode: "fill",
          opacity: 0.2, // If supported, otherwise it just prints gray
        });
      } catch (e) {
        // Fallback for older jsPDF versions
        doc.text("HydroChain Certified", pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 45,
        });
      }
    }
  }

  /**
   * Generate a PDF certificate for credit issuance
   */
  generateIssuanceCertificate(creditData, producerInfo) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header with branding
    doc.setFillColor(34, 197, 94); // Green color
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("HydroChain", margin, 25);

    doc.setFontSize(12);
    doc.text("Green Hydrogen Credit Certificate", margin, 35);

    // Certificate title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("CREDIT ISSUANCE CERTIFICATE", pageWidth / 2, 65, {
      align: "center",
    });

    let yPos = 90;

    // Certificate details
    doc.setFontSize(12);
    doc.text("This is to certify that:", margin, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`${producerInfo.name || "Producer"}`, margin, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`(${producerInfo.email})`, margin, yPos);
    yPos += 25;

    doc.text(
      "Has successfully issued the following Green Hydrogen Credits:",
      margin,
      yPos,
    );
    yPos += 20;

    // Credit details box
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 80);

    yPos += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Credit Details:", margin + 10, yPos);
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    yPos += 15;

    const details = [
      `Volume: ${creditData.volume} MWh`,
      `Token ID: #${creditData.token_id || "Pending"}`,
      `Description: ${creditData.description || "Green Hydrogen Credit"}`,
      `Transaction Hash: ${creditData.tx_hash || "N/A"}`,
      `Issue Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    ];

    details.forEach((detail) => {
      doc.text(detail, margin + 10, yPos);
      yPos += 10;
    });

    yPos += 20;

    // Verification section
    doc.setFontSize(12);
    doc.text(
      "This certificate verifies the issuance of green hydrogen credits",
      margin,
      yPos,
    );
    yPos += 10;
    doc.text(
      "in accordance with environmental standards and blockchain verification.",
      margin,
      yPos,
    );
    yPos += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toISOString()}`, margin, yPos);
    doc.text(
      `Certificate ID: ISSUE-${creditData.id || Date.now()}`,
      margin,
      yPos + 10,
    );

    this.addWatermark(doc);
    return doc;
  }

  /**
   * Generate a PDF certificate for credit purchase
   */
  generatePurchaseCertificate(creditData, buyerInfo, transaction) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header with branding
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("HydroChain", margin, 25);

    doc.setFontSize(12);
    doc.text("Green Hydrogen Credit Purchase Certificate", margin, 35);

    // Certificate title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("CREDIT PURCHASE CERTIFICATE", pageWidth / 2, 65, {
      align: "center",
    });

    let yPos = 90;

    // Certificate details
    doc.setFontSize(12);
    doc.text("This certifies that:", margin, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`${buyerInfo.name || "Buyer"}`, margin, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`(${buyerInfo.email})`, margin, yPos);
    yPos += 25;

    doc.text(
      "Has successfully purchased the following Green Hydrogen Credits:",
      margin,
      yPos,
    );
    yPos += 20;

    // Credit details box
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 100);

    yPos += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Purchase Details:", margin + 10, yPos);
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    yPos += 15;

    const details = [
      `Volume: ${creditData.volume} kg H₂`,
      `Token ID: #${creditData.token_id || creditData.id}`,
      `Total Paid: $${transaction?.price || "N/A"}`,
      `Unit Price: $${transaction?.unitPrice || "N/A"}/kg`,
      `Transaction Hash: ${transaction?.blockchainTx || "N/A"}`,
      `Purchase Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    ];

    details.forEach((detail) => {
      doc.text(detail, margin + 10, yPos);
      yPos += 10;
    });

    yPos += 20;

    // Verification section
    doc.setFontSize(12);
    doc.text(
      "This certificate confirms the legal ownership transfer of green hydrogen",
      margin,
      yPos,
    );
    yPos += 10;
    doc.text(
      "credits and compliance with carbon offset regulations.",
      margin,
      yPos,
    );
    yPos += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toISOString()}`, margin, yPos);
    doc.text(
      `Certificate ID: PURCHASE-${creditData.id || Date.now()}`,
      margin,
      yPos + 10,
    );

    this.addWatermark(doc);
    return doc;
  }

  /**
   * Generate a PDF certificate for credit audit
   */
  generateAuditCertificate(creditData, auditorInfo, auditResult) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header with branding
    doc.setFillColor(147, 51, 234); // Purple color
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("HydroChain", margin, 25);

    doc.setFontSize(12);
    doc.text("Green Hydrogen Credit Audit Certificate", margin, 35);

    // Certificate title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("CREDIT AUDIT CERTIFICATE", pageWidth / 2, 65, {
      align: "center",
    });

    let yPos = 90;

    // Certificate details
    doc.setFontSize(12);
    doc.text("This certifies that:", margin, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`${auditorInfo.name || "Auditor"}`, margin, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`(${auditorInfo.email})`, margin, yPos);
    yPos += 25;

    doc.text(
      "Has completed a comprehensive audit of the following credit:",
      margin,
      yPos,
    );
    yPos += 20;

    // Credit details box
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 120);

    yPos += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Audit Results:", margin + 10, yPos);
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    yPos += 15;

    const details = [
      `Credit Volume: ${creditData.volume} MWh`,
      `Token ID: #${creditData.token_id || creditData.id}`,
      `Audit Decision: ${auditResult.decision?.toUpperCase() || "APPROVED"}`,
      `Audit Status: ${auditResult.status || "VERIFIED"}`,
      `Compliance Score: ${auditResult.complianceScore || "EXCELLENT"}`,
      `Audit Notes: ${auditResult.notes || "All compliance requirements met"}`,
      `Audit Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    ];

    details.forEach((detail) => {
      doc.text(detail, margin + 10, yPos);
      yPos += 10;
    });

    yPos += 20;

    // Verification section
    doc.setFontSize(12);
    doc.text(
      "This audit confirms compliance with international green hydrogen",
      margin,
      yPos,
    );
    yPos += 10;
    doc.text("standards and environmental regulations.", margin, yPos);
    yPos += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toISOString()}`, margin, yPos);
    doc.text(
      `Certificate ID: AUDIT-${creditData.id || Date.now()}`,
      margin,
      yPos + 10,
    );

    this.addWatermark(doc);
    return doc;
  }

  /**
   * Generate a PDF certificate for credit retirement
   */
  generateRetirementCertificate(creditData, ownerInfo, retirementReason) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header with branding
    doc.setFillColor(239, 68, 68); // Red color
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("HydroChain", margin, 25);

    doc.setFontSize(12);
    doc.text("Green Hydrogen Credit Retirement Certificate", margin, 35);

    // Certificate title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("CREDIT RETIREMENT CERTIFICATE", pageWidth / 2, 65, {
      align: "center",
    });

    let yPos = 90;

    // Certificate details
    doc.setFontSize(12);
    doc.text("This certifies that:", margin, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`${ownerInfo.name || "Credit Owner"}`, margin, yPos);
    doc.setFont(undefined, "normal");
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`(${ownerInfo.email})`, margin, yPos);
    yPos += 25;

    doc.text(
      "Has permanently retired the following Green Hydrogen Credits:",
      margin,
      yPos,
    );
    yPos += 20;

    // Credit details box
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 100);

    yPos += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Retirement Details:", margin + 10, yPos);
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    yPos += 15;

    const details = [
      `Volume: ${creditData.volume} MWh`,
      `Token ID: #${creditData.token_id || creditData.id}`,
      `Retirement Reason: ${retirementReason}`,
      `Original Issue Date: ${
        creditData.created_at
          ? new Date(creditData.created_at).toLocaleDateString()
          : "N/A"
      }`,
      `Retirement Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      `Status: PERMANENTLY RETIRED`,
    ];

    details.forEach((detail) => {
      doc.text(detail, margin + 10, yPos);
      yPos += 10;
    });

    yPos += 20;

    // Verification section
    doc.setFontSize(12);
    doc.text(
      "These credits have been permanently removed from circulation",
      margin,
      yPos,
    );
    yPos += 10;
    doc.text(
      "and cannot be resold, ensuring no double-counting of offsets.",
      margin,
      yPos,
    );
    yPos += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toISOString()}`, margin, yPos);
    doc.text(
      `Certificate ID: RETIRE-${creditData.id || Date.now()}`,
      margin,
      yPos + 10,
    );

    this.addWatermark(doc);
    return doc;
  }

  /**
   * Generate local PDF blob URL
   */
  generatePdfBlobUrl(doc) {
    return doc.output("bloburl");
  }

  async generateAndUploadIssuanceCertificate(creditData, producerInfo) {
    console.log("Generating issuance certificate PDF...");
    const doc = this.generateIssuanceCertificate(creditData, producerInfo);
    return {
      url: this.generatePdfBlobUrl(doc),
      isLocal: true,
      message: "PDF generated locally",
    };
  }

  async generateAndUploadPurchaseCertificate(
    creditData,
    buyerInfo,
    transaction,
  ) {
    console.log("Generating purchase certificate PDF...");
    const doc = this.generatePurchaseCertificate(
      creditData,
      buyerInfo,
      transaction,
    );
    return {
      url: this.generatePdfBlobUrl(doc),
      isLocal: true,
      message: "PDF generated locally",
    };
  }

  async generateAndUploadAuditCertificate(
    creditData,
    auditorInfo,
    auditResult,
  ) {
    console.log("Generating audit certificate PDF...");
    const doc = this.generateAuditCertificate(
      creditData,
      auditorInfo,
      auditResult,
    );
    return {
      url: this.generatePdfBlobUrl(doc),
      isLocal: true,
      message: "PDF generated locally",
    };
  }

  async generateAndUploadRetirementCertificate(
    creditData,
    ownerInfo,
    retirementReason,
  ) {
    console.log("Generating retirement certificate PDF...");
    const doc = this.generateRetirementCertificate(
      creditData,
      ownerInfo,
      retirementReason,
    );
    return {
      url: this.generatePdfBlobUrl(doc),
      isLocal: true,
      message: "PDF generated locally",
    };
  }

  validateConfig() {
    return true; // Always valid for local generation
  }
}

export default new PDFService();
