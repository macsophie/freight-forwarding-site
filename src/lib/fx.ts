/**
 * Multi-Currency FX Engine for International Freight Forwarding
 * Supports major logistics trading currencies: USD, EUR, GBP, CNY, AED, SGD.
 * Provides currency conversion, exchange rate caching, and currency formatting.
 */

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CNY' | 'AED' | 'SGD';

export interface FXRate {
  baseCurrency: SupportedCurrency;
  rates: Record<SupportedCurrency, number>;
  timestamp: string;
}

// Baseline exchange rates anchored to USD
export const BASELINE_USD_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  CNY: 7.24,
  AED: 3.6725,
  SGD: 1.34,
};

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'CNY',
  'AED',
  'SGD',
];

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  AED: 'AED ',
  SGD: 'S$',
};

export class FXEngine {
  private rates: Record<SupportedCurrency, number>;
  private lastUpdated: Date;

  constructor(initialRates = BASELINE_USD_RATES) {
    this.rates = { ...initialRates };
    this.lastUpdated = new Date();
  }

  /**
   * Converts an amount from one currency to another using the current exchange rates.
   */
  public convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): { convertedAmount: number; rateUsed: number } {
    const from = (fromCurrency.toUpperCase() as SupportedCurrency);
    const to = (toCurrency.toUpperCase() as SupportedCurrency);

    if (from === to) {
      return { convertedAmount: amount, rateUsed: 1.0 };
    }

    const fromRate = this.rates[from] || 1.0;
    const toRate = this.rates[to] || 1.0;

    // Convert from source currency to USD, then from USD to target currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;
    const effectiveRate = toRate / fromRate;

    return {
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rateUsed: Math.round(effectiveRate * 10000) / 10000,
    };
  }

  /**
   * Retrieves current exchange rate between two currencies.
   */
  public getRate(fromCurrency: string, toCurrency: string): number {
    const from = (fromCurrency.toUpperCase() as SupportedCurrency);
    const to = (toCurrency.toUpperCase() as SupportedCurrency);

    if (from === to) return 1.0;

    const fromRate = this.rates[from] || 1.0;
    const toRate = this.rates[to] || 1.0;

    return Math.round((toRate / fromRate) * 10000) / 10000;
  }

  /**
   * Updates exchange rates (e.g. from external ECB / Open Exchange Rates feed).
   */
  public updateRates(newRates: Partial<Record<SupportedCurrency, number>>): void {
    this.rates = {
      ...this.rates,
      ...newRates,
    };
    this.lastUpdated = new Date();
  }

  /**
   * Formats an amount in a specified currency with symbol.
   */
  public format(amount: number, currency: string): string {
    const curr = (currency.toUpperCase() as SupportedCurrency);
    const symbol = CURRENCY_SYMBOLS[curr] || `${curr} `;
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  public getSnapshot(): FXRate {
    return {
      baseCurrency: 'USD',
      rates: { ...this.rates },
      timestamp: this.lastUpdated.toISOString(),
    };
  }
}

// Global shared instance
export const fxEngine = new FXEngine();
