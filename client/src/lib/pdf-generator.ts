import { jsPDF } from "jspdf";
import type { Invoice, Client } from "@shared/schema";

export async function generateInvoicePDF(invoice: Invoice, client: Client) {
  const doc = new jsPDF();
  
  // Company header
  doc.setFontSize(24);
  doc.setTextColor(21, 101, 192); // Primary blue
  doc.text("InvoiceFlow Pro", 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Professional Invoice & Enquiry Management", 20, 38);
  
  // Invoice details
  doc.setFontSize(16);
  doc.text("INVOICE", 150, 30);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 40);
  doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 150, 48);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 56);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 150, 64);
  
  // Bill to section
  doc.setFontSize(12);
  doc.text("Bill To:", 20, 80);
  
  doc.setFontSize(10);
  let yPos = 90;
  doc.text(client.name, 20, yPos);
  yPos += 8;
  
  if (client.company) {
    doc.text(client.company, 20, yPos);
    yPos += 8;
  }
  
  doc.text(client.email, 20, yPos);
  yPos += 8;
  
  if (client.phone) {
    doc.text(client.phone, 20, yPos);
    yPos += 8;
  }
  
  if (client.address) {
    const addressLines = client.address.split('\n');
    addressLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 8;
    });
  }
  
  // Invoice items table
  yPos = Math.max(yPos + 20, 140);
  
  // Table header
  doc.setFillColor(245, 247, 250); // Light gray background
  doc.rect(20, yPos - 8, 170, 16, 'F');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 25, yPos);
  doc.text("HSN", 100, yPos);
  doc.text("Qty", 120, yPos);
  doc.text("Rate", 140, yPos);
  doc.text("Amount", 165, yPos);
  
  yPos += 12;
  
  // Table items
  doc.setFont("helvetica", "normal");
  invoice.items.forEach((item: any) => {
    doc.text(item.description, 25, yPos);
    doc.text(item.hsn || "-", 100, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(`$${item.rate.toFixed(2)}`, 140, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, 165, yPos);
    yPos += 12;
  });
  
  // Totals
  yPos += 10;
  doc.line(120, yPos, 190, yPos); // Horizontal line
  yPos += 10;
  
  doc.text("Subtotal:", 120, yPos);
  doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 165, yPos);
  yPos += 8;
  
  doc.text("Tax (10%):", 120, yPos);
  doc.text(`$${parseFloat(invoice.tax).toFixed(2)}`, 165, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 120, yPos);
  doc.text(`$${parseFloat(invoice.total).toFixed(2)}`, 165, yPos);
  
  // Notes
  if (invoice.notes) {
    yPos += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, yPos);
    yPos += 8;
    
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(noteLines, 20, yPos);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for your business!", 20, pageHeight - 20);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 150, pageHeight - 20);
  
  // Download the PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
