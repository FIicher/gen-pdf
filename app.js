// ============================================
// Application principale - Gestion du formulaire et calculs
// ============================================

// Variables globales
let invoiceLines = [];
let lineCounter = 0;

// ============================================
// Initialisation
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    attachEventListeners();
    addInvoiceLine(); // Ajoute une première ligne par défaut
    
    // Charge les données sauvegardées si disponibles
    loadSavedData();
});

/**
 * Initialise le formulaire avec les valeurs par défaut
 */
function initializeForm() {
    // Date du jour
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;
    document.getElementById('serviceDate').value = today;
    
    // Date d'échéance (30 jours)
    const dueDate = calculateDueDate(today, 30);
    document.getElementById('paymentDueDate').value = dueDate;
    
    // Numéro de facture automatique
    document.getElementById('invoiceNumber').value = generateInvoiceNumber();
    
    // Mention TVA par défaut
    updateVATMention();
}

/**
 * Attache les événements aux éléments du formulaire
 */
function attachEventListeners() {
    // Boutons principaux
    document.getElementById('addLineBtn').addEventListener('click', addInvoiceLine);
    document.getElementById('previewBtn').addEventListener('click', generatePreview);
    document.getElementById('generatePdfBtn').addEventListener('click', generateAndDownloadPDF);
    
    // Changement de régime TVA
    document.getElementById('vatRegime').addEventListener('change', function() {
        updateVATMention();
        recalculateAll();
    });
    
    // Changement de date d'émission
    document.getElementById('issueDate').addEventListener('change', function() {
        const dueDate = calculateDueDate(this.value, 30);
        document.getElementById('paymentDueDate').value = dueDate;
    });
    
    // Acompte et remise globale
    document.getElementById('deposit').addEventListener('input', debounce(recalculateAll, 300));
    document.getElementById('globalDiscount').addEventListener('input', debounce(recalculateAll, 300));
    
    // Reset du formulaire
    document.querySelector('form').addEventListener('reset', function() {
        setTimeout(() => {
            invoiceLines = [];
            lineCounter = 0;
            document.getElementById('invoiceLines').innerHTML = '';
            initializeForm();
            addInvoiceLine();
            recalculateAll();
        }, 10);
    });
    
    // Sauvegarde automatique
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', debounce(autoSave, 1000));
    });
}

/**
 * Met à jour la mention TVA selon le régime
 */
function updateVATMention() {
    const regime = document.getElementById('vatRegime').value;
    const mention = getVATMention(regime);
    document.getElementById('vatMention').value = mention;
}

/**
 * Ajoute une ligne de facturation
 */
function addInvoiceLine() {
    lineCounter++;
    const lineId = generateUniqueId();
    
    const lineHTML = `
        <div class="invoice-line" data-line-id="${lineId}">
            <div class="line-header">
                <h4>Ligne ${lineCounter}</h4>
                <button type="button" class="btn-remove-line" onclick="removeLine('${lineId}')">
                    🗑️ Supprimer
                </button>
            </div>
            
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Désignation *</label>
                    <input type="text" class="line-designation" placeholder="Ex: Développement site web" required>
                </div>
                
                <div class="form-group full-width">
                    <label>Description détaillée</label>
                    <textarea class="line-description" rows="2" placeholder="Description complémentaire"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Quantité *</label>
                    <input type="number" class="line-quantity" step="0.01" value="1" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>Unité</label>
                    <select class="line-unit">
                        <option value="unité">unité</option>
                        <option value="heure">heure</option>
                        <option value="jour" selected>jour</option>
                        <option value="pièce">pièce</option>
                        <option value="m²">m²</option>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="forfait">forfait</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Prix unitaire HT (€) *</label>
                    <input type="number" class="line-unit-price" step="0.01" value="0" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>Remise (%)</label>
                    <input type="number" class="line-discount" step="0.01" value="0" min="0" max="100">
                </div>
                
                <div class="form-group">
                    <label>Taux TVA (%)</label>
                    <select class="line-vat-rate">
                        <option value="0">0%</option>
                        <option value="2.1">2,1%</option>
                        <option value="5.5">5,5%</option>
                        <option value="10">10%</option>
                        <option value="20" selected>20%</option>
                    </select>
                </div>
            </div>
            
            <div class="line-totals">
                <div class="line-total-item">
                    <span class="label">Total HT</span>
                    <span class="value line-total-ht">0,00 €</span>
                </div>
                <div class="line-total-item">
                    <span class="label">TVA</span>
                    <span class="value line-total-vat">0,00 €</span>
                </div>
                <div class="line-total-item">
                    <span class="label">Total TTC</span>
                    <span class="value line-total-ttc">0,00 €</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceLines').insertAdjacentHTML('beforeend', lineHTML);
    
    // Attache les événements de calcul à cette ligne
    const lineElement = document.querySelector(`[data-line-id="${lineId}"]`);
    const inputs = lineElement.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            calculateLineTotal(lineId);
            recalculateAll();
        }, 300));
    });
    
    // Calcul initial
    calculateLineTotal(lineId);
}

/**
 * Supprime une ligne de facturation
 */
function removeLine(lineId) {
    const line = document.querySelector(`[data-line-id="${lineId}"]`);
    if (line) {
        line.remove();
        recalculateAll();
        
        // Si plus aucune ligne, en ajoute une
        if (document.querySelectorAll('.invoice-line').length === 0) {
            addInvoiceLine();
        }
    }
}

/**
 * Calcule le total d'une ligne
 */
function calculateLineTotal(lineId) {
    const line = document.querySelector(`[data-line-id="${lineId}"]`);
    if (!line) return;
    
    const quantity = parseFloat(line.querySelector('.line-quantity').value) || 0;
    const unitPrice = parseFloat(line.querySelector('.line-unit-price').value) || 0;
    const discount = parseFloat(line.querySelector('.line-discount').value) || 0;
    const vatRate = parseFloat(line.querySelector('.line-vat-rate').value) || 0;
    
    const regime = document.getElementById('vatRegime').value;
    const effectiveVatRate = isTVAApplicable(regime) ? vatRate : 0;
    
    // Calculs - utilise la fonction de utils.js avec un nom différent
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const totalHT = subtotal - discountAmount;
    const totalVAT = (totalHT * effectiveVatRate) / 100;
    const totalTTC = totalHT + totalVAT;
    
    // Affichage
    const currency = document.getElementById('currency').value || 'EUR';
    line.querySelector('.line-total-ht').textContent = formatCurrency(totalHT, currency);
    line.querySelector('.line-total-vat').textContent = formatCurrency(totalVAT, currency);
    line.querySelector('.line-total-ttc').textContent = formatCurrency(totalTTC, currency);
}

/**
 * Recalcule tous les totaux
 */
function recalculateAll() {
    const lines = document.querySelectorAll('.invoice-line');
    const currency = document.getElementById('currency').value;
    const regime = document.getElementById('vatRegime').value;
    const globalDiscount = parseFloat(document.getElementById('globalDiscount').value) || 0;
    const deposit = parseFloat(document.getElementById('deposit').value) || 0;
    
    let totalHT = 0;
    let totalVAT = 0;
    const vatByRate = {};
    
    // Collecte les données des lignes
    lines.forEach(line => {
        const quantity = parseFloat(line.querySelector('.line-quantity').value) || 0;
        const unitPrice = parseFloat(line.querySelector('.line-unit-price').value) || 0;
        const discount = parseFloat(line.querySelector('.line-discount').value) || 0;
        const vatRate = parseFloat(line.querySelector('.line-vat-rate').value) || 0;
        
        const lineHT = calculateLineTotal(quantity, unitPrice, discount);
        totalHT += lineHT;
        
        const effectiveVatRate = isTVAApplicable(regime) ? vatRate : 0;
        const lineVAT = calculateLineVAT(lineHT, effectiveVatRate);
        totalVAT += lineVAT;
        
        // Regroupe par taux
        if (!vatByRate[effectiveVatRate]) {
            vatByRate[effectiveVatRate] = {
                rate: effectiveVatRate,
                baseHT: 0,
                vatAmount: 0
            };
        }
        vatByRate[effectiveVatRate].baseHT += lineHT;
        vatByRate[effectiveVatRate].vatAmount += lineVAT;
    });
    
    // Applique la remise globale
    const discountAmount = (totalHT * globalDiscount) / 100;
    totalHT -= discountAmount;
    
    // Recalcule la TVA après remise globale
    if (globalDiscount > 0) {
        totalVAT = 0;
        Object.keys(vatByRate).forEach(rate => {
            const baseAfterDiscount = vatByRate[rate].baseHT * (1 - globalDiscount / 100);
            const vatAmount = (baseAfterDiscount * parseFloat(rate)) / 100;
            vatByRate[rate].baseHT = baseAfterDiscount;
            vatByRate[rate].vatAmount = vatAmount;
            totalVAT += vatAmount;
        });
    }
    
    const totalTTC = totalHT + totalVAT;
    const netToPay = totalTTC - deposit;
    
    // Affichage dans le panneau flottant
    document.getElementById('displayTotalHT').textContent = formatCurrency(totalHT, currency);
    document.getElementById('displayTotalVAT').textContent = formatCurrency(totalVAT, currency);
    document.getElementById('displayTotalTTC').textContent = formatCurrency(totalTTC, currency);
    document.getElementById('displayDeposit').textContent = formatCurrency(deposit, currency);
    document.getElementById('displayNetToPay').textContent = formatCurrency(netToPay, currency);
}

/**
 * Collecte toutes les données du formulaire
 */
function collectFormData() {
    const lines = [];
    document.querySelectorAll('.invoice-line').forEach(line => {
        const quantity = parseFloat(line.querySelector('.line-quantity').value) || 0;
        const unitPrice = parseFloat(line.querySelector('.line-unit-price').value) || 0;
        const discount = parseFloat(line.querySelector('.line-discount').value) || 0;
        const vatRate = parseFloat(line.querySelector('.line-vat-rate').value) || 0;
        
        const regime = document.getElementById('vatRegime').value;
        const effectiveVatRate = isTVAApplicable(regime) ? vatRate : 0;
        
        const totalHT = calculateLineTotal(quantity, unitPrice, discount);
        const totalVAT = calculateLineVAT(totalHT, effectiveVatRate);
        
        lines.push({
            designation: line.querySelector('.line-designation').value,
            description: line.querySelector('.line-description').value,
            quantity: quantity,
            unit: line.querySelector('.line-unit').value,
            unitPrice: unitPrice,
            discount: discount,
            vatRate: effectiveVatRate,
            totalHT: totalHT,
            totalVAT: totalVAT,
            totalTTC: totalHT + totalVAT
        });
    });
    
    const globalDiscount = parseFloat(document.getElementById('globalDiscount').value) || 0;
    let totalHT = lines.reduce((sum, line) => sum + line.totalHT, 0);
    const discountAmount = (totalHT * globalDiscount) / 100;
    totalHT -= discountAmount;
    
    let totalVAT = 0;
    if (globalDiscount > 0) {
        lines.forEach(line => {
            const adjustedHT = line.totalHT * (1 - globalDiscount / 100);
            const adjustedVAT = (adjustedHT * line.vatRate) / 100;
            totalVAT += adjustedVAT;
        });
    } else {
        totalVAT = lines.reduce((sum, line) => sum + line.totalVAT, 0);
    }
    
    const totalTTC = totalHT + totalVAT;
    const deposit = parseFloat(document.getElementById('deposit').value) || 0;
    const netToPay = totalTTC - deposit;
    
    return {
        // A. Identification
        docType: document.getElementById('docType').value,
        invoiceNumber: document.getElementById('invoiceNumber').value,
        issueDate: document.getElementById('issueDate').value,
        serviceDate: document.getElementById('serviceDate').value,
        internalRef: document.getElementById('internalRef').value,
        currency: document.getElementById('currency').value,
        
        // B. Vendeur
        seller: {
            name: document.getElementById('sellerName').value,
            legalForm: document.getElementById('sellerLegalForm').value,
            capital: document.getElementById('sellerCapital').value,
            address: document.getElementById('sellerAddress').value,
            postalCode: document.getElementById('sellerPostalCode').value,
            city: document.getElementById('sellerCity').value,
            country: document.getElementById('sellerCountry').value,
            phone: document.getElementById('sellerPhone').value,
            email: document.getElementById('sellerEmail').value,
            website: document.getElementById('sellerWebsite').value,
            siren: document.getElementById('sellerSIREN').value,
            siret: document.getElementById('sellerSIRET').value,
            rcs: document.getElementById('sellerRCS').value,
            vat: document.getElementById('sellerVAT').value
        },
        
        // C. Client
        client: {
            name: document.getElementById('clientName').value,
            address: document.getElementById('clientAddress').value,
            postalCode: document.getElementById('clientPostalCode').value,
            city: document.getElementById('clientCity').value,
            country: document.getElementById('clientCountry').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            vat: document.getElementById('clientVAT').value,
            ref: document.getElementById('clientRef').value
        },
        
        // D. Lignes
        lines: lines,
        
        // E. Totaux
        totals: {
            totalHT: totalHT,
            totalVAT: totalVAT,
            totalTTC: totalTTC,
            deposit: deposit,
            globalDiscount: globalDiscount,
            discountAmount: discountAmount,
            netToPay: netToPay,
            inWords: numberToWords(netToPay)
        },
        
        // F. TVA
        vat: {
            regime: document.getElementById('vatRegime').value,
            mention: document.getElementById('vatMention').value,
            byRate: calculateVATByRate(lines)
        },
        
        // G. Paiement
        payment: {
            dueDate: document.getElementById('paymentDueDate').value,
            status: document.getElementById('paymentStatus').value,
            methods: getSelectedPaymentMethods(),
            iban: document.getElementById('iban').value,
            bic: document.getElementById('bic').value,
            reference: document.getElementById('paymentRef').value
        },
        
        // H. Mentions légales
        legal: {
            penaltyRate: document.getElementById('penaltyRate').value,
            recoveryFee: document.getElementById('recoveryFee').value,
            termsConditions: document.getElementById('termsConditions').value,
            insurance: document.getElementById('insuranceMention').value,
            propertyReserve: document.getElementById('propertyReserve').value,
            additionalNotes: document.getElementById('additionalNotes').value
        }
    };
}

/**
 * Génère la prévisualisation HTML
 */
function generatePreview() {
    const data = collectFormData();
    const previewContainer = document.getElementById('preview');
    
    let linesHTML = '';
    data.lines.forEach((line, index) => {
        linesHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <strong>${escapeHtml(line.designation)}</strong>
                    ${line.description ? '<br><small>' + escapeHtml(line.description) + '</small>' : ''}
                </td>
                <td class="text-right">${line.quantity}</td>
                <td>${line.unit}</td>
                <td class="text-right">${formatCurrency(line.unitPrice, data.currency)}</td>
                <td class="text-right">${line.discount > 0 ? line.discount + '%' : '-'}</td>
                <td class="text-right">${formatCurrency(line.totalHT, data.currency)}</td>
                <td class="text-right">${line.vatRate}%</td>
                <td class="text-right font-bold">${formatCurrency(line.totalTTC, data.currency)}</td>
            </tr>
        `;
    });
    
    let vatDetailsHTML = '';
    if (data.vat.byRate.length > 0) {
        data.vat.byRate.forEach(vat => {
            vatDetailsHTML += `
                <div class="total-row">
                    <span>TVA ${vat.rate}% sur ${formatCurrency(vat.baseHT, data.currency)}</span>
                    <span>${formatCurrency(vat.vatAmount, data.currency)}</span>
                </div>
            `;
        });
    }
    
    const html = `
        <div class="invoice-preview">
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">${data.docType}</div>
                    <p><strong>N° ${data.invoiceNumber}</strong></p>
                    <p>Émise le : ${formatDate(data.issueDate)}</p>
                    ${data.serviceDate ? '<p>Date de prestation : ' + formatDate(data.serviceDate) + '</p>' : ''}
                </div>
                <div class="invoice-info">
                    ${data.internalRef ? '<p>Réf. interne : ' + escapeHtml(data.internalRef) + '</p>' : ''}
                    <p>Devise : ${data.currency}</p>
                </div>
            </div>
            
            <div class="invoice-parties">
                <div class="party-box">
                    <h3>🏢 Vendeur / Prestataire</h3>
                    <p><strong>${escapeHtml(data.seller.name)}</strong></p>
                    ${data.seller.legalForm ? '<p>' + data.seller.legalForm + '</p>' : ''}
                    ${data.seller.capital ? '<p>Capital : ' + escapeHtml(data.seller.capital) + '</p>' : ''}
                    <p>${escapeHtml(data.seller.address)}</p>
                    <p>${data.seller.postalCode} ${escapeHtml(data.seller.city)}</p>
                    <p>${escapeHtml(data.seller.country)}</p>
                    <p>📞 ${data.seller.phone}</p>
                    <p>✉️ ${data.seller.email}</p>
                    ${data.seller.website ? '<p>🌐 ' + escapeHtml(data.seller.website) + '</p>' : ''}
                    <p><strong>SIREN :</strong> ${data.seller.siren}</p>
                    <p><strong>SIRET :</strong> ${data.seller.siret}</p>
                    ${data.seller.rcs ? '<p><strong>RCS :</strong> ' + escapeHtml(data.seller.rcs) + '</p>' : ''}
                    ${data.seller.vat ? '<p><strong>TVA :</strong> ' + escapeHtml(data.seller.vat) + '</p>' : ''}
                </div>
                
                <div class="party-box">
                    <h3>👤 Client</h3>
                    <p><strong>${escapeHtml(data.client.name)}</strong></p>
                    <p>${escapeHtml(data.client.address)}</p>
                    <p>${data.client.postalCode} ${escapeHtml(data.client.city)}</p>
                    <p>${escapeHtml(data.client.country)}</p>
                    ${data.client.phone ? '<p>📞 ' + data.client.phone + '</p>' : ''}
                    ${data.client.email ? '<p>✉️ ' + data.client.email + '</p>' : ''}
                    ${data.client.vat ? '<p><strong>TVA :</strong> ' + escapeHtml(data.client.vat) + '</p>' : ''}
                    ${data.client.ref ? '<p><strong>Réf. client :</strong> ' + escapeHtml(data.client.ref) + '</p>' : ''}
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">#</th>
                        <th>Désignation</th>
                        <th class="text-right">Qté</th>
                        <th>Unité</th>
                        <th class="text-right">P.U. HT</th>
                        <th class="text-right">Remise</th>
                        <th class="text-right">Total HT</th>
                        <th class="text-right">TVA</th>
                        <th class="text-right">Total TTC</th>
                    </tr>
                </thead>
                <tbody>
                    ${linesHTML}
                </tbody>
            </table>
            
            <div class="invoice-totals">
                ${data.totals.globalDiscount > 0 ? 
                    '<div class="total-row"><span>Total avant remise</span><span>' + 
                    formatCurrency(data.totals.totalHT + data.totals.discountAmount, data.currency) + '</span></div>' +
                    '<div class="total-row"><span>Remise globale (' + data.totals.globalDiscount + '%)</span><span>- ' + 
                    formatCurrency(data.totals.discountAmount, data.currency) + '</span></div>' : ''}
                <div class="total-row">
                    <span>Total HT</span>
                    <span>${formatCurrency(data.totals.totalHT, data.currency)}</span>
                </div>
                ${vatDetailsHTML}
                <div class="total-row">
                    <span>Total TVA</span>
                    <span>${formatCurrency(data.totals.totalVAT, data.currency)}</span>
                </div>
                <div class="total-row highlight">
                    <span>Total TTC</span>
                    <span>${formatCurrency(data.totals.totalTTC, data.currency)}</span>
                </div>
                ${data.totals.deposit > 0 ? 
                    '<div class="total-row"><span>Acompte versé</span><span>- ' + 
                    formatCurrency(data.totals.deposit, data.currency) + '</span></div>' : ''}
                <div class="total-row highlight">
                    <span><strong>NET À PAYER</strong></span>
                    <span><strong>${formatCurrency(data.totals.netToPay, data.currency)}</strong></span>
                </div>
                <div class="total-row">
                    <span colspan="2" style="font-style: italic; font-size: 0.875rem;">
                        ${data.totals.inWords}
                    </span>
                </div>
            </div>
            
            ${data.vat.mention ? '<p class="text-muted" style="margin: 1rem 0;"><strong>TVA :</strong> ' + escapeHtml(data.vat.mention) + '</p>' : ''}
            
            <div style="margin: 2rem 0; padding: 1rem; background: var(--bg-light); border-radius: 0.5rem;">
                <h4 style="margin-bottom: 0.5rem;">💳 Conditions de paiement</h4>
                <p><strong>Date limite :</strong> ${formatDate(data.payment.dueDate)}</p>
                <p><strong>Modes acceptés :</strong> ${data.payment.methods.join(', ')}</p>
                ${data.payment.iban ? '<p><strong>IBAN :</strong> ' + escapeHtml(data.payment.iban) + '</p>' : ''}
                ${data.payment.bic ? '<p><strong>BIC :</strong> ' + escapeHtml(data.payment.bic) + '</p>' : ''}
                ${data.payment.reference ? '<p>' + escapeHtml(data.payment.reference) + '</p>' : ''}
            </div>
            
            <div class="invoice-footer">
                <h4 style="margin-bottom: 0.5rem;">⚖️ Mentions légales</h4>
                <p>En cas de retard de paiement, seront exigibles des pénalités de retard au taux de ${data.legal.penaltyRate}% 
                ainsi qu'une indemnité forfaitaire de recouvrement de ${formatCurrency(parseFloat(data.legal.recoveryFee), data.currency)}.</p>
                ${data.legal.termsConditions ? '<p>' + escapeHtml(data.legal.termsConditions) + '</p>' : ''}
                ${data.legal.insurance ? '<p>' + escapeHtml(data.legal.insurance) + '</p>' : ''}
                ${data.legal.propertyReserve ? '<p>' + escapeHtml(data.legal.propertyReserve) + '</p>' : ''}
                ${data.legal.additionalNotes ? '<p>' + escapeHtml(data.legal.additionalNotes) + '</p>' : ''}
            </div>
        </div>
    `;
    
    previewContainer.innerHTML = html;
    showNotification('Prévisualisation générée avec succès', 'success');
}

/**
 * Sauvegarde automatique
 */
function autoSave() {
    const data = collectFormData();
    saveToLocalStorage('invoiceData', data);
}

/**
 * Charge les données sauvegardées
 */
function loadSavedData() {
    const savedData = loadFromLocalStorage('invoiceData');
    if (savedData && confirm('Des données sauvegardées ont été trouvées. Voulez-vous les charger ?')) {
        // Implémentation du chargement
        // (à développer selon les besoins)
        showNotification('Données chargées', 'info');
    }
}

/**
 * Génère et télécharge le PDF
 */
function generateAndDownloadPDF() {
    const data = collectFormData();
    
    // Validation basique
    if (!data.invoiceNumber || !data.seller.name || !data.client.name) {
        showNotification('Veuillez remplir les champs obligatoires', 'error');
        return;
    }
    
    if (data.lines.length === 0) {
        showNotification('Ajoutez au moins une ligne de facturation', 'error');
        return;
    }
    
    try {
        generatePDF(data);
        showNotification('PDF généré avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    }
}
