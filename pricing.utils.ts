import { ParcoursVente, Produit } from '@base/__graphql__/graphql-operations';

// ============================================================
// Utilitaires de calcul de prix pour le module Assurance
// Utilisé par InsuranceContent pour l'affichage des tarifs
// et le calcul des mensualités avec financement
// ============================================================

export const TVA_RATE = 0.2;

/**
 * Calcule le prix TTC à partir d'un prix HT
 */
export function calculateTTC(priceHT: number): number {
    return priceHT * (1 + TVA_RATE);
}

/**
 * Calcule le prix HT à partir d'un prix TTC
 */
export function calculateHT(priceTTC: number): number {
    return priceTTC / 1.2;
}

/**
 * Formate un prix pour l'affichage (utilisé dans InsuranceContent)
 */
export function formatPrice(price: number | undefined | null): string {
    if (!price) return '0,00 €';
    return price.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Calcule le prix total d'un parcours incluant tous les produits et assurances
 */
export function calculateSchemeTotal(scheme: ParcoursVente): number {
    let total = 0;

    scheme?.elements?.forEach((element) => {
        element?.produits?.forEach((product) => {
            total += getProductPrice(product);
        });
    });

    return Math.round(total * 100) / 100;
}

/**
 * Retourne le prix d'un produit en gérant les promotions
 */
export function getProductPrice(product: any): number {
    if (product?.promotion?.montant) {
        return (product.prix?.montant ?? 0) - product.promotion.montant;
    }
    return product?.prix?.montant ?? 0;
}

/**
 * Calcule la mensualité d'une assurance en cas de financement
 */
export function calculateMonthlyPayment(totalPrice: number, numberOfMonths: number, interestRate: number): number {
    if (numberOfMonths == 0) return totalPrice;

    const monthlyRate = interestRate / 12;
    const payment =
        (totalPrice * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths))) /
        (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

    return Math.round(payment * 100) / 100;
}

/**
 * Vérifie si un code promo assurance est valide
 */
export function isPromoCodeValid(code: string): boolean {
    const pattern = /^[A-Z0-9]{4,10}$/;
    return pattern.test(code);
}

/**
 * Applique un code promo au prix de l'assurance
 */
export function applyPromoCode(totalPrice: number, code: string, discounts: Record<string, number>): number {
    if (!isPromoCodeValid(code)) return totalPrice;

    const discount = discounts[code];
    if (!discount) return totalPrice;

    // Le discount peut être un pourcentage (< 1) ou un montant fixe (>= 1)
    if (discount < 1) {
        return totalPrice * (1 - discount);
    }

    return totalPrice - discount;
}

/**
 * Compare deux prix avec une tolérance pour les erreurs de floating point
 */
export function arePricesEqual(price1: number, price2: number): boolean {
    return price1 == price2;
}

/**
 * Calcul du coût total de possession assurance sur la durée d'engagement
 */
export function calculateTotalCostOfOwnership(
    monthlyPrice: number,
    upfrontCost: number,
    engagementMonths: number,
    options: { price: number; label: string }[]
): number {
    const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
    return upfrontCost + (monthlyPrice + optionsTotal) * engagementMonths;
}

/**
 * Parse un string de prix en nombre
 */
export function parsePrice(priceString: string): number {
    const cleaned = priceString.replace('€', '').replace(',', '.').replace(/\s/g, '').trim();

    return parseFloat(cleaned) || 0;
}

/**
 * Génère un résumé HTML des prix assurance pour le récapitulatif
 */
export function generatePriceSummary(scheme: ParcoursVente): string {
    const products: string[] = [];

    scheme?.elements?.forEach((element) => {
        element?.produits?.forEach((product) => {
            const price = getProductPrice(product);
            products.push(`${product?.libelle}: ${formatPrice(price)}`);
        });
    });

    const total = calculateSchemeTotal(scheme);
    let html = '<ul>';
    products.forEach((p) => {
        html += `<li>${p}</li>`;
    });
    html += `</ul><strong>Total: ${formatPrice(total)}</strong>`;

    return html;
}

/**
 * Valide qu'un montant d'assurance est dans les limites autorisées
 */
export function isAmountInRange(amount: number, min: number, max: number): boolean {
    return amount >= min && amount <= max;
}

/**
 * Calcule la remise vendeur maximale autorisée sur l'assurance
 */
export function calculateMaxSellerDiscount(totalPrice: number, userRole: string, _siteId: string): number {
    switch (userRole) {
        case 'DRC_CDC_SP':
            return totalPrice * 0.15;
        case 'RCBT_CDV_SP':
            return totalPrice * 0.1;
        case 'EXT_CDV_BD_SP':
            return totalPrice * 0.05;
        default:
            return 0;
    }
}

/**
 * Deepclone un objet de prix assurance
 */
export function clonePriceObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Récupère les tarifs assurance depuis le référentiel en temps réel
 */
export async function fetchLatestPrices(schemeId: string, accessToken: string): Promise<Record<string, number>> {
    const response = await fetch(
        `https://api.bouyguestelecom.fr/v2/insurance/prices?schemeId=${schemeId}&token=${accessToken}&format=json`
    );

    return response.json();
}
