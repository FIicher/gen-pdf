// ============================================
// Générateur de PDF avec jsPDF
// ============================================

/**
 * Génère et télécharge le PDF de la facture
 */
function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Configuration
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = margin;
    
    // Couleurs
    const primaryColor = [37, 99, 235]; // Bleu
    const darkColor = [30, 41, 59];
    const lightGray = [226, 232, 240];
    
    // ============================================
    // En-tête
    // ============================================
    
    // Titre du document
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(data.docType, margin, currentY);
    
    // Ligne de séparation
    currentY += 8;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // Informations de facturation
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Numéro:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.invoiceNumber, margin + 25, currentY);
    
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Date d\'émission:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDateShort(data.issueDate), margin + 25, currentY);
    
    if (data.serviceDate) {
        currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Date de prestation:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDateShort(data.serviceDate), margin + 25, currentY);
    }
    
    if (data.internalRef) {
        currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Référence:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(data.internalRef, margin + 25, currentY);
    }
    
    currentY += 10;
    
    // ============================================
    // Informations Vendeur / Client
    // ============================================
    
    const boxY = currentY;
    const boxHeight = 50;
    const boxWidth = (contentWidth / 2) - 5;
    
    // Encadré Vendeur
    doc.setFillColor(...lightGray);
    doc.rect(margin, boxY, boxWidth, boxHeight, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, boxY, boxWidth, boxHeight);
    
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('VENDEUR / PRESTATAIRE', margin + 2, boxY + 5);
    
    let vendorY = boxY + 10;
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(data.seller.name, margin + 2, vendorY, { maxWidth: boxWidth - 4 });
    
    vendorY += 5;
    doc.setFont('helvetica', 'normal');
    if (data.seller.legalForm) {
        doc.text(data.seller.legalForm, margin + 2, vendorY);
        vendorY += 4;
    }
    
    doc.text(data.seller.address, margin + 2, vendorY, { maxWidth: boxWidth - 4 });
    vendorY += 4;
    doc.text(`${data.seller.postalCode} ${data.seller.city}`, margin + 2, vendorY);
    vendorY += 4;
    doc.text(data.seller.country, margin + 2, vendorY);
    vendorY += 4;
    doc.text(`Tél: ${data.seller.phone}`, margin + 2, vendorY);
    vendorY += 4;
    doc.text(`Email: ${data.seller.email}`, margin + 2, vendorY);
    vendorY += 4;
    doc.text(`SIRET: ${data.seller.siret}`, margin + 2, vendorY);
    
    if (data.seller.vat) {
        vendorY += 4;
        doc.text(`TVA: ${data.seller.vat}`, margin + 2, vendorY);
    }
    
    // Encadré Client
    const clientX = margin + boxWidth + 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(clientX, boxY, boxWidth, boxHeight, 'F');
    doc.setDrawColor(...primaryColor);
    doc.rect(clientX, boxY, boxWidth, boxHeight);
    
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT', clientX + 2, boxY + 5);
    
    let clientY = boxY + 10;
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(data.client.name, clientX + 2, clientY, { maxWidth: boxWidth - 4 });
    
    clientY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(data.client.address, clientX + 2, clientY, { maxWidth: boxWidth - 4 });
    clientY += 4;
    doc.text(`${data.client.postalCode} ${data.client.city}`, clientX + 2, clientY);
    clientY += 4;
    doc.text(data.client.country, clientX + 2, clientY);
    
    if (data.client.phone) {
        clientY += 4;
        doc.text(`Tél: ${data.client.phone}`, clientX + 2, clientY);
    }
    
    if (data.client.email) {
        clientY += 4;
        doc.text(`Email: ${data.client.email}`, clientX + 2, clientY);
    }
    
    if (data.client.vat) {
        clientY += 4;
        doc.text(`TVA: ${data.client.vat}`, clientX + 2, clientY);
    }
    
    currentY = boxY + boxHeight + 10;
    
    // ============================================
    // Tableau des lignes de facturation
    // ============================================
    
    doc.setFontSize(7);
    
    // En-tête du tableau
    const tableStartY = currentY;
    const rowHeight = 6;
    const colWidths = [8, 55, 15, 12, 20, 15, 20, 15, 20];
    
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    let xPos = margin + 1;
    const headers = ['#', 'Désignation', 'Qté', 'Unité', 'P.U. HT', 'Rem.', 'Total HT', 'TVA', 'Total TTC'];
    
    headers.forEach((header, index) => {
        if (index === 1) {
            doc.text(header, xPos, currentY + 4);
        } else {
            doc.text(header, xPos + (colWidths[index] / 2), currentY + 4, { align: 'center' });
        }
        xPos += colWidths[index];
    });
    
    currentY += rowHeight;
    
    // Lignes du tableau
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    
    data.lines.forEach((line, index) => {
        // Vérifier si on doit changer de page
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = margin;
        }
        
        // Fond alterné
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
        }
        
        xPos = margin + 1;
        
        // # 
        doc.text(String(index + 1), xPos + (colWidths[0] / 2), currentY + 4, { align: 'center' });
        xPos += colWidths[0];
        
        // Désignation
        doc.setFont('helvetica', 'bold');
        doc.text(line.designation, xPos, currentY + 4, { maxWidth: colWidths[1] - 2 });
        if (line.description) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(6);
            doc.text(line.description.substring(0, 50), xPos, currentY + 4 + 2.5, { maxWidth: colWidths[1] - 2 });
            doc.setFontSize(7);
        }
        doc.setFont('helvetica', 'normal');
        xPos += colWidths[1];
        
        // Quantité
        doc.text(line.quantity.toString(), xPos + (colWidths[2] / 2), currentY + 4, { align: 'center' });
        xPos += colWidths[2];
        
        // Unité
        doc.text(line.unit, xPos + (colWidths[3] / 2), currentY + 4, { align: 'center' });
        xPos += colWidths[3];
        
        // Prix unitaire HT
        doc.text(formatCurrency(line.unitPrice, data.currency), xPos + colWidths[4] - 1, currentY + 4, { align: 'right' });
        xPos += colWidths[4];
        
        // Remise
        doc.text(line.discount > 0 ? `${line.discount}%` : '-', xPos + (colWidths[5] / 2), currentY + 4, { align: 'center' });
        xPos += colWidths[5];
        
        // Total HT
        doc.text(formatCurrency(line.totalHT, data.currency), xPos + colWidths[6] - 1, currentY + 4, { align: 'right' });
        xPos += colWidths[6];
        
        // TVA
        doc.text(`${line.vatRate}%`, xPos + (colWidths[7] / 2), currentY + 4, { align: 'center' });
        xPos += colWidths[7];
        
        // Total TTC
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(line.totalTTC, data.currency), xPos + colWidths[8] - 1, currentY + 4, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        currentY += rowHeight;
    });
    
    // Ligne de fin de tableau
    doc.setDrawColor(...darkColor);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += 10;
    
    // ============================================
    // Totaux
    // ============================================
    
    const totalsX = pageWidth - margin - 70;
    const totalsWidth = 70;
    
    doc.setFontSize(9);
    
    // Remise globale si applicable
    if (data.totals.globalDiscount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('Total avant remise:', totalsX, currentY);
        doc.text(formatCurrency(data.totals.totalHT + data.totals.discountAmount, data.currency), 
                 totalsX + totalsWidth, currentY, { align: 'right' });
        currentY += 5;
        
        doc.text(`Remise globale (${data.totals.globalDiscount}%):`, totalsX, currentY);
        doc.text(`- ${formatCurrency(data.totals.discountAmount, data.currency)}`, 
                 totalsX + totalsWidth, currentY, { align: 'right' });
        currentY += 5;
    }
    
    // Total HT
    doc.setFont('helvetica', 'bold');
    doc.text('Total HT:', totalsX, currentY);
    doc.text(formatCurrency(data.totals.totalHT, data.currency), totalsX + totalsWidth, currentY, { align: 'right' });
    currentY += 5;
    
    // Détails TVA
    doc.setFont('helvetica', 'normal');
    if (data.vat.byRate.length > 0) {
        data.vat.byRate.forEach(vat => {
            doc.text(`TVA ${vat.rate}%:`, totalsX, currentY);
            doc.text(formatCurrency(vat.vatAmount, data.currency), totalsX + totalsWidth, currentY, { align: 'right' });
            currentY += 4;
        });
    }
    
    // Total TVA
    doc.setFont('helvetica', 'bold');
    doc.text('Total TVA:', totalsX, currentY);
    doc.text(formatCurrency(data.totals.totalVAT, data.currency), totalsX + totalsWidth, currentY, { align: 'right' });
    currentY += 6;
    
    // Total TTC
    doc.setFillColor(...primaryColor);
    doc.rect(totalsX - 2, currentY - 4, totalsWidth + 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('TOTAL TTC:', totalsX, currentY);
    doc.text(formatCurrency(data.totals.totalTTC, data.currency), totalsX + totalsWidth, currentY, { align: 'right' });
    currentY += 7;
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(9);
    
    // Acompte
    if (data.totals.deposit > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('Acompte versé:', totalsX, currentY);
        doc.text(`- ${formatCurrency(data.totals.deposit, data.currency)}`, totalsX + totalsWidth, currentY, { align: 'right' });
        currentY += 6;
    }
    
    // Net à payer
    doc.setFillColor(16, 185, 129);
    doc.rect(totalsX - 2, currentY - 4, totalsWidth + 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NET À PAYER:', totalsX, currentY);
    doc.text(formatCurrency(data.totals.netToPay, data.currency), totalsX + totalsWidth, currentY, { align: 'right' });
    currentY += 8;
    
    // Montant en lettres
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(data.totals.inWords, margin, currentY, { maxWidth: contentWidth });
    currentY += 8;
    
    // ============================================
    // Mention TVA
    // ============================================
    
    if (data.vat.mention) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(data.vat.mention, margin, currentY, { maxWidth: contentWidth });
        currentY += 6;
    }
    
    // ============================================
    // Conditions de paiement
    // ============================================
    
    doc.setFillColor(248, 250, 252);
    const paymentBoxHeight = 25;
    doc.rect(margin, currentY, contentWidth, paymentBoxHeight, 'F');
    doc.setDrawColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, paymentBoxHeight);
    
    currentY += 5;
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS DE PAIEMENT', margin + 2, currentY);
    
    currentY += 5;
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date limite de paiement: ${formatDateShort(data.payment.dueDate)}`, margin + 2, currentY);
    currentY += 4;
    doc.text(`Modes de paiement acceptés: ${data.payment.methods.join(', ')}`, margin + 2, currentY);
    
    if (data.payment.iban) {
        currentY += 4;
        doc.text(`IBAN: ${data.payment.iban}`, margin + 2, currentY);
    }
    
    if (data.payment.bic) {
        currentY += 4;
        doc.text(`BIC: ${data.payment.bic}`, margin + 2, currentY);
    }
    
    currentY += 10;
    
    // ============================================
    // Mentions légales (pied de page)
    // ============================================
    
    // Vérifier s'il faut une nouvelle page
    if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = margin;
    }
    
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('MENTIONS LÉGALES', margin, currentY);
    currentY += 4;
    
    doc.setFont('helvetica', 'normal');
    const legalText = `En cas de retard de paiement, seront exigibles des pénalités de retard au taux de ${data.legal.penaltyRate}% ainsi qu'une indemnité forfaitaire de recouvrement de ${formatCurrency(parseFloat(data.legal.recoveryFee), data.currency)}.`;
    doc.text(legalText, margin, currentY, { maxWidth: contentWidth });
    currentY += 8;
    
    if (data.legal.termsConditions) {
        doc.text(data.legal.termsConditions, margin, currentY, { maxWidth: contentWidth });
        currentY += 6;
    }
    
    if (data.legal.insurance) {
        doc.text(data.legal.insurance, margin, currentY, { maxWidth: contentWidth });
        currentY += 4;
    }
    
    if (data.legal.propertyReserve) {
        doc.text(data.legal.propertyReserve, margin, currentY, { maxWidth: contentWidth });
        currentY += 4;
    }
    
    if (data.legal.additionalNotes) {
        currentY += 2;
        doc.setFont('helvetica', 'italic');
        doc.text(data.legal.additionalNotes, margin, currentY, { maxWidth: contentWidth });
    }
    
    // ============================================
    // Pied de page avec numéro de page
    // ============================================
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `${data.docType} ${data.invoiceNumber} - Page ${i}/${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }
    
    // ============================================
    // Téléchargement
    // ============================================
    
    const fileName = `${data.docType.replace(/\s+/g, '_')}_${data.invoiceNumber.replace(/\s+/g, '_')}_${data.client.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}
