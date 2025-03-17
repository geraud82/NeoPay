import jsPDF from 'jspdf';
import { PayStatement } from '@/types/payStatement';
import 'jspdf-autotable';

// Function to generate a PDF from a pay statement
export function generatePayStatementPDF(payStatement: PayStatement, companyName: string = 'NeoPay'): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Define colors
  const primaryColor = [66, 70, 229]; // RGB for primary color
  const secondaryColor = [41, 44, 143]; // Darker shade for headers
  const accentColor = [247, 148, 30]; // Orange accent
  const lightGray = [240, 240, 240]; // Light gray for backgrounds
  const mediumGray = [200, 200, 200]; // Medium gray for lines
  const darkGray = [100, 100, 100]; // Dark gray for secondary text
  
  // Add gradient header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add company logo/header
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 20, 20);
  
  // Add pay statement title
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Pay Statement', 20, 30);
  
  // Add statement ID and status badge
  const status = payStatement.status?.toUpperCase() || 'DRAFT';
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`ID: ${payStatement.id || 'NEW'}`, 170, 15, { align: 'right' });
  
  // Add status badge
  const statusColors: Record<string, number[]> = {
    'DRAFT': [150, 150, 150],
    'FINALIZED': [247, 148, 30],
    'PAID': [46, 204, 113]
  };
  const statusColor = statusColors[status] || statusColors['DRAFT'];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(150, 18, 40, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(status, 170, 24, { align: 'center' });
  
  // Add driver information section
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, 50, 170, 30, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Driver Information', 25, 60);
  
  // Add driver details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  // Left column
  doc.text('Driver:', 25, 70);
  doc.setFont('helvetica', 'bold');
  doc.text(payStatement.driverName, 60, 70);
  
  // Right column
  doc.setFont('helvetica', 'normal');
  doc.text('Pay Period:', 110, 70);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDate(payStatement.periodStart)} - ${formatDate(payStatement.periodEnd)}`, 145, 70);
  
  // Add generated date
  doc.setFontSize(8);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${formatDate(payStatement.generatedDate)}`, 170, 45, { align: 'right' });
  
  // Add manual trip details if available
  let startY = 95;
  if (payStatement.tripDetails) {
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, 90, 170, 30, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Details', 25, 100);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Split the trip details into lines to fit within the box
    const tripDetailsLines = doc.splitTextToSize(payStatement.tripDetails, 160);
    doc.text(tripDetailsLines, 25, 110);
    
    // Adjust the starting Y position for the payment summary
    startY = 130;
  }
  
  // Add payment summary section
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 20, startY);
  
  // Add summary table
  doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  
  // Create summary table
  const summaryData = [
    ['Trip Earnings (Gross Pay)', formatCurrency(payStatement.grossPay)],
    ['Tax Withholding', `-${formatCurrency(payStatement.taxWithholding)}`],
    ['Deductions', `-${formatCurrency(payStatement.deductionsTotal)}`],
    ['Expenses', `-${formatCurrency(payStatement.expenseTotal)}`],
    ['Cash Advances', `-${formatCurrency(payStatement.cashAdvanceTotal)}`]
  ];
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: startY + 5,
    head: [['Description', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 40, halign: 'right' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add total section with accent background
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.1);
  doc.rect(20, finalY, 170, 15, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Pay', 25, finalY + 10);
  
  doc.setFontSize(12);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(formatCurrency(payStatement.netPay), 170, finalY + 10, { align: 'right' });
  
  // Add trips section if there are trips
  if (payStatement.trips && payStatement.trips.length > 0) {
    doc.addPage();
    
    // Add section header with background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Details', 20, 13);
    
    // Create trip table data
    const tripData = payStatement.trips.map(trip => [
      formatDate(trip.date),
      trip.origin.substring(0, 20),
      trip.destination.substring(0, 20),
      `${trip.distance} mi`,
      trip.rateType === 'hourly' ? `${trip.hoursWorked || 0} hrs` : '',
      trip.rateType === 'per_mile' ? `$${trip.rate}/mi` : 
        trip.rateType === 'percentage' ? `${trip.rate}%` : 
        trip.rateType === 'hourly' ? `$${trip.rate}/hr` : `$${trip.rate}`,
      formatCurrency(trip.amount)
    ]);
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Origin', 'Destination', 'Distance', 'Hours', 'Rate', 'Amount']],
      body: tripData,
      theme: 'grid',
      headStyles: {
        fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        6: { halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Add expenses section if there are expenses
  if (payStatement.expenses && payStatement.expenses.length > 0) {
    doc.addPage();
    
    // Add section header with background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Details', 20, 13);
    
    // Create expense table data
    const expenseData = payStatement.expenses.map(expense => [
      formatDate(expense.date),
      expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
      expense.description.substring(0, 40),
      expense.reimbursable ? 'Yes' : 'No',
      expense.reimbursementStatus ? expense.reimbursementStatus.charAt(0).toUpperCase() + expense.reimbursementStatus.slice(1) : '',
      formatCurrency(expense.amount)
    ]);
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Category', 'Description', 'Reimbursable', 'Status', 'Amount']],
      body: expenseData,
      theme: 'grid',
      headStyles: {
        fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        5: { halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Add cash advances section if there are cash advances
  if (payStatement.cashAdvances && payStatement.cashAdvances.length > 0) {
    doc.addPage();
    
    // Add section header with background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Cash Advance Details', 20, 13);
    
    // Create cash advance table data
    const cashAdvanceData = payStatement.cashAdvances.map(advance => [
      formatDate(advance.date),
      advance.description.substring(0, 60),
      advance.status.charAt(0).toUpperCase() + advance.status.slice(1),
      formatCurrency(advance.amount)
    ]);
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Description', 'Status', 'Amount']],
      body: cashAdvanceData,
      theme: 'grid',
      headStyles: {
        fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        3: { halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Add deductions section if there are deductions
  if (payStatement.deductions && payStatement.deductions.length > 0) {
    doc.addPage();
    
    // Add section header with background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Deduction Details', 20, 13);
    
    // Create deductions table data
    const deductionsData = payStatement.deductions.map(deduction => [
      formatDate(deduction.date),
      deduction.type.charAt(0).toUpperCase() + deduction.type.slice(1),
      deduction.description.substring(0, 60),
      formatCurrency(deduction.amount)
    ]);
    
    // Add tax withholding as a deduction
    deductionsData.push([
      formatDate(payStatement.generatedDate),
      'Tax',
      'Tax Withholding',
      formatCurrency(payStatement.taxWithholding)
    ]);
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Type', 'Description', 'Amount']],
      body: deductionsData,
      theme: 'grid',
      headStyles: {
        fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        3: { halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Add footer with page numbers and company info
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add footer line
    doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.line(20, 280, 190, 280);
    
    // Add page numbers
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    
    // Add company info
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`${companyName} Trucking Solutions`, 20, 287);
    doc.text('www.neopay.com', 190, 287, { align: 'right' });
  }
  
  return doc;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
