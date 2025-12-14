// ============================================
// Utilitaires généraux
// ============================================

/**
 * Convertit un nombre en lettres (français)
 */
function numberToWords(number) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    
    if (number === 0) return 'zéro';
    
    let words = '';
    
    // Partie entière
    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);
    
    // Millions
    const millions = Math.floor(integerPart / 1000000);
    if (millions > 0) {
        if (millions === 1) {
            words += 'un million ';
        } else {
            words += convertHundreds(millions) + ' millions ';
        }
    }
    
    // Milliers
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    if (thousands > 0) {
        if (thousands === 1) {
            words += 'mille ';
        } else {
            words += convertHundreds(thousands) + ' mille ';
        }
    }
    
    // Centaines
    const hundreds = integerPart % 1000;
    if (hundreds > 0) {
        words += convertHundreds(hundreds);
    }
    
    words = words.trim();
    
    // Partie décimale
    if (decimalPart > 0) {
        words += ' euros et ' + convertHundreds(decimalPart) + ' centimes';
    } else {
        words += ' euros';
    }
    
    return words.charAt(0).toUpperCase() + words.slice(1);
}

function convertHundreds(num) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    
    let words = '';
    
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    
    if (hundred > 0) {
        if (hundred === 1) {
            words += 'cent';
        } else {
            words += units[hundred] + ' cent';
        }
        if (remainder === 0 && hundred > 1) {
            words += 's';
        }
        if (remainder > 0) {
            words += ' ';
        }
    }
    
    if (remainder >= 10 && remainder < 20) {
        words += teens[remainder - 10];
    } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;
        
        if (ten > 0) {
            words += tens[ten];
            if (ten === 8 && unit === 0) {
                words += 's';
            }
            if (unit > 0) {
                if (ten === 7 || ten === 9) {
                    words += '-' + teens[unit];
                } else if (unit === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
                    words += ' et un';
                } else {
                    words += '-' + units[unit];
                }
            }
        } else if (unit > 0) {
            words += units[unit];
        }
    }
    
    return words;
}

/**
 * Formate un nombre en devise
 */
function formatCurrency(amount, currency = 'EUR') {
    // Validation de amount
    if (amount === undefined || amount === null || isNaN(amount)) {
        amount = 0;
    }
    
    const symbols = {
        'EUR': '€',
        'USD': '$',
        'GBP': '£',
        'CHF': 'CHF'
    };
    
    return parseFloat(amount).toFixed(2).replace('.', ',') + ' ' + symbols[currency];
}

/**
 * Formate une date au format français
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Formate une date au format court
 */
function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

/**
 * Calcule le total HT d'une ligne
 */
function calculateLineTotal(quantity, unitPrice, discount) {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
}

/**
 * Calcule la TVA d'une ligne
 */
function calculateLineVAT(totalHT, vatRate) {
    return (totalHT * vatRate) / 100;
}

/**
 * Valide un numéro SIRET
 */
function validateSIRET(siret) {
    siret = siret.replace(/\s/g, '');
    if (siret.length !== 14) return false;
    
    let sum = 0;
    let tmp;
    
    for (let i = 0; i < siret.length; i++) {
        if ((i % 2) === 0) {
            tmp = parseInt(siret.charAt(i)) * 2;
            if (tmp > 9) tmp -= 9;
        } else {
            tmp = parseInt(siret.charAt(i));
        }
        sum += tmp;
    }
    
    return (sum % 10) === 0;
}

/**
 * Valide un IBAN
 */
function validateIBAN(iban) {
    iban = iban.replace(/\s/g, '').toUpperCase();
    
    // Vérification de la longueur basique
    if (iban.length < 15 || iban.length > 34) return false;
    
    // Simple vérification du format (FR suivi de 2 chiffres)
    if (iban.startsWith('FR')) {
        return /^FR\d{2}/.test(iban);
    }
    
    return true;
}

/**
 * Génère un numéro de facture automatique
 */
function generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FA-${year}${month}-${random}`;
}

/**
 * Calcule la date d'échéance
 */
function calculateDueDate(issueDate, daysToAdd = 30) {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
}

/**
 * Échappe les caractères HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Obtient les modes de paiement sélectionnés
 */
function getSelectedPaymentMethods() {
    const checkboxes = document.querySelectorAll('input[name="paymentMethod"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Valide un email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Sauvegarde les données dans localStorage
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
        return false;
    }
}

/**
 * Charge les données depuis localStorage
 */
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Erreur de chargement:', e);
        return null;
    }
}

/**
 * Calcule les totaux par taux de TVA
 */
function calculateVATByRate(lines) {
    const vatByRate = {};
    
    lines.forEach(line => {
        const rate = parseFloat(line.vatRate) || 0;
        const totalHT = parseFloat(line.totalHT) || 0;
        const vatAmount = (totalHT * rate) / 100;
        
        if (!vatByRate[rate]) {
            vatByRate[rate] = {
                rate: rate,
                baseHT: 0,
                vatAmount: 0
            };
        }
        
        vatByRate[rate].baseHT += totalHT;
        vatByRate[rate].vatAmount += vatAmount;
    });
    
    return Object.values(vatByRate);
}

/**
 * Génère un ID unique
 */
function generateUniqueId() {
    return 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Détermine la mention TVA selon le régime
 */
function getVATMention(regime) {
    const mentions = {
        'autoEntrepreneur': 'TVA non applicable - art. 293B du CGI',
        'autoliquidation': 'Autoliquidation de la TVA par le preneur',
        'exoneration': 'Exonération de TVA',
        'intracommunautaire': 'TVA intracommunautaire - Autoliquidation',
        'normal': ''
    };
    return mentions[regime] || '';
}

/**
 * Vérifie si le régime de TVA permet l'application de TVA
 */
function isTVAApplicable(regime) {
    return regime === 'normal';
}

/**
 * Débounce function pour optimiser les événements
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Affiche un message de notification
 */
function showNotification(message, type = 'info') {
    // Crée ou réutilise le conteneur de notification
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(notification);
    }
    
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#2563eb'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
