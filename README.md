# 📄 Générateur de Factures Professionnel

Application web complète pour générer des factures PDF conformes aux normes françaises.

## 🎯 Fonctionnalités

### ✅ Identification du document
- Type de document (Facture, Facture d'avoir, Facture pro forma)
- Numéro de facture unique et chronologique
- Dates d'émission et de prestation
- Référence interne optionnelle
- Multi-devises (EUR, USD, GBP, CHF)

### 🏢 Informations complètes
- **Vendeur/Prestataire** : Raison sociale, forme juridique, capital social, coordonnées complètes, SIREN/SIRET, RCS, TVA intracommunautaire
- **Client** : Toutes coordonnées nécessaires incluant la TVA intracommunautaire

### 📝 Lignes de facturation
- Désignation et description détaillée
- Quantité et unité (heure, jour, pièce, m², kg, etc.)
- Prix unitaire HT
- Remise par ligne (%)
- Calcul automatique des totaux (HT, TVA, TTC)
- Support de plusieurs taux de TVA (0%, 2.1%, 5.5%, 10%, 20%)

### 💰 Gestion financière
- Calcul automatique de tous les totaux
- Remise globale
- Acomptes déjà versés
- Net à payer
- Conversion du montant en lettres (français)
- Regroupement TVA par taux

### 💼 TVA & fiscalité
- Régime TVA normal
- Auto-entrepreneur (TVA non applicable - art. 293B du CGI)
- Autoliquidation TVA (BTP, UE)
- Exonération TVA
- TVA intracommunautaire
- Mentions fiscales personnalisables

### 💳 Conditions de paiement
- Date limite de paiement
- Modes de paiement multiples (Virement, CB, Chèque, Espèces, PayPal)
- Coordonnées bancaires (IBAN, BIC)
- Statut de la facture (brouillon, envoyée, payée, impayée)

### ⚖️ Mentions légales
- Pénalités de retard (taux personnalisable)
- Indemnité forfaitaire de recouvrement (40€ par défaut)
- Conditions générales de vente
- Assurance professionnelle
- Clause de réserve de propriété
- Notes additionnelles

### 🎨 Interface utilisateur
- **Responsive** : Optimisée pour PC, tablette et mobile
- **Intuitive** : Formulaire organisé en sections claires
- **Prévisualisation en temps réel** : Visualisez la facture avant génération
- **Calculs automatiques** : Tous les totaux se mettent à jour en temps réel
- **Design professionnel** : Interface moderne et élégante
- **Panneau flottant des totaux** : Toujours visible pendant la saisie

### 📥 Export PDF
- Génération de PDF professionnel
- Mise en page optimisée
- Toutes les informations et mentions légales incluses
- Nom de fichier intelligent
- Multi-pages si nécessaire

## 🚀 Utilisation

1. **Ouvrez** `index.html` dans votre navigateur
2. **Remplissez** les informations du formulaire :
   - Informations du vendeur/prestataire
   - Informations du client
   - Ajoutez des lignes de facturation
   - Configurez les conditions de paiement
3. **Prévisualisez** en temps réel votre facture
4. **Téléchargez** le PDF final

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design responsive et moderne
- **JavaScript ES6** : Logique métier et calculs
- **jsPDF** : Génération de PDF côté client

## 📋 Secteurs d'activité supportés

L'application supporte tous les secteurs professionnels avec des particularités de facturation :

- Développeurs web / logiciel
- Graphistes / Designers
- Consultants
- Artisans (plombier, électricien)
- BTP / Maçonnerie
- Auto-entrepreneurs
- Commerçants
- Restaurateurs
- Freelance IT
- Formateurs
- Coaches
- Photographes
- Vidéastes
- Architectes
- Avocats
- Professions médicales libérales
- Transporteurs
- Chauffeurs VTC
- Agents immobiliers
- E-commerce
- Community managers
- Services d'impression
- Hébergement web / SaaS
- Coaches sportifs
- Nettoyage
- Événementiel
- Et bien d'autres...

## ✨ Fonctionnalités avancées

- ✅ Calcul automatique des totaux
- ✅ Gestion multi-taux de TVA
- ✅ Conversion montant en lettres
- ✅ Prévisualisation en temps réel
- ✅ Interface responsive (mobile, tablette, PC)
- ✅ Sauvegarde automatique (localStorage)
- ✅ Validation des données
- ✅ Mentions légales conformes
- ✅ Support des différents régimes fiscaux
- ✅ Gestion des acomptes
- ✅ Remises (par ligne et globale)
- ✅ Multi-devises

## 📱 Responsive Design

L'application s'adapte parfaitement à tous les écrans :
- **Mobile** : Interface optimisée pour la saisie tactile
- **Tablette** : Layout adapté pour un confort optimal
- **Desktop** : Vue côte à côte (formulaire + prévisualisation)

## 🔒 Conformité

- ✅ Conforme aux obligations légales françaises
- ✅ Mentions légales obligatoires
- ✅ Numérotation chronologique
- ✅ Informations SIRET/SIREN/TVA
- ✅ Pénalités de retard
- ✅ Indemnité forfaitaire de recouvrement

## 🎯 Cas d'usage

- Factures de vente
- Factures de prestation de services
- Factures d'avoir
- Factures pro forma
- Factures avec acomptes
- Factures internationales (TVA intracommunautaire)
- Factures BTP (autoliquidation)
- Factures auto-entrepreneur

## 📝 Notes

- Tous les calculs sont effectués automatiquement
- La prévisualisation est mise à jour en temps réel
- Les données peuvent être sauvegardées automatiquement
- Le PDF généré est de qualité professionnelle
- Aucune installation requise, fonctionne directement dans le navigateur

## 🌐 Compatibilité navigateur

- Chrome/Edge (recommandé)
- Firefox
- Safari
- Opera

## 📄 Licence

© 2025 - Générateur de Factures Professionnel

---

**Professionnel • Conforme • Facile à utiliser**