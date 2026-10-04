import { describe, it, expect } from "vitest";
import { fxEngine, FXEngine } from "@/lib/fx";
import {
  resolveTradeCorridor,
  calculateRateCardQuote,
} from "@/lib/rate-card";

describe("Multi-Currency FX Engine", () => {
  it("converts between identical currencies with rate 1.0", () => {
    const res = fxEngine.convert(1000, "USD", "USD");
    expect(res.convertedAmount).toBe(1000);
    expect(res.rateUsed).toBe(1.0);
  });

  it("converts USD to EUR correctly using baseline rate", () => {
    // Baseline EUR rate: 0.92 per USD
    const res = fxEngine.convert(1000, "USD", "EUR");
    expect(res.convertedAmount).toBe(920);
    expect(res.rateUsed).toBe(0.92);
  });

  it("converts EUR to GBP via USD cross rate", () => {
    // 100 EUR -> USD (100 / 0.92 = 108.70) -> GBP (108.70 * 0.78 = 84.78)
    const res = fxEngine.convert(100, "EUR", "GBP");
    expect(res.convertedAmount).toBeGreaterThan(80);
    expect(res.convertedAmount).toBeLessThan(90);
  });

  it("allows updating live rates dynamically", () => {
    const customEngine = new FXEngine();
    customEngine.updateRates({ EUR: 0.95 });
    const res = customEngine.convert(1000, "USD", "EUR");
    expect(res.convertedAmount).toBe(950);
  });

  it("formats currencies properly with localized symbols", () => {
    expect(fxEngine.format(1250.5, "USD")).toBe("$1,250.50");
    expect(fxEngine.format(850, "EUR")).toBe("€850.00");
    expect(fxEngine.format(500, "GBP")).toBe("£500.00");
  });
});

describe("Trade Lane Corridors & Rate Card Engine", () => {
  it("resolves Asia to North America as TRANSPACIFIC_EB", () => {
    expect(resolveTradeCorridor("CN", "US")).toBe("TRANSPACIFIC_EB");
    expect(resolveTradeCorridor("KR", "US")).toBe("TRANSPACIFIC_EB");
    expect(resolveTradeCorridor("VN", "CA")).toBe("TRANSPACIFIC_EB");
  });

  it("resolves Asia to Europe as ASIA_EUROPE_WB", () => {
    expect(resolveTradeCorridor("CN", "DE")).toBe("ASIA_EUROPE_WB");
    expect(resolveTradeCorridor("JP", "NL")).toBe("ASIA_EUROPE_WB");
    expect(resolveTradeCorridor("SG", "GB")).toBe("ASIA_EUROPE_WB");
  });

  it("resolves Europe to North America as TRANSATLANTIC_WB", () => {
    expect(resolveTradeCorridor("DE", "US")).toBe("TRANSATLANTIC_WB");
    expect(resolveTradeCorridor("GB", "US")).toBe("TRANSATLANTIC_WB");
  });

  it("calculates Ocean FCL quote with transit time and surcharges", () => {
    const quote = calculateRateCardQuote({
      corridor: "TRANSPACIFIC_EB",
      mode: "OCEAN_FCL",
      grossWeightKg: 18000,
      totalCbm: 28, // 1 container
      tier: "STANDARD",
    });

    expect(quote.baseFreight).toBe(2400); // 1 container * 2400
    expect(quote.transitDaysEstimate).toBe(18);
    expect(quote.bunkerFuelSurcharge).toBeGreaterThan(0);
    expect(quote.netTotalAmount).toBeGreaterThan(2400);
    expect(quote.volumeTierDiscount).toBe(0);
  });

  it("applies Volume Tier Discounts (Gold = 10%, Platinum = 15%)", () => {
    const standardQuote = calculateRateCardQuote({
      corridor: "TRANSPACIFIC_EB",
      mode: "OCEAN_FCL",
      grossWeightKg: 18000,
      totalCbm: 28,
      tier: "STANDARD",
    });

    const goldQuote = calculateRateCardQuote({
      corridor: "TRANSPACIFIC_EB",
      mode: "OCEAN_FCL",
      grossWeightKg: 18000,
      totalCbm: 28,
      tier: "GOLD",
    });

    const platinumQuote = calculateRateCardQuote({
      corridor: "TRANSPACIFIC_EB",
      mode: "OCEAN_FCL",
      grossWeightKg: 18000,
      totalCbm: 28,
      tier: "PLATINUM",
    });

    expect(goldQuote.volumeTierDiscount).toBeGreaterThan(0);
    expect(platinumQuote.volumeTierDiscount).toBeGreaterThan(goldQuote.volumeTierDiscount);
    expect(goldQuote.netTotalAmount).toBeLessThan(standardQuote.netTotalAmount);
    expect(platinumQuote.netTotalAmount).toBeLessThan(goldQuote.netTotalAmount);
  });

  it("applies hazardous cargo surcharge when flagged", () => {
    const normal = calculateRateCardQuote({
      corridor: "ASIA_EUROPE_WB",
      mode: "AIR",
      grossWeightKg: 500,
      totalCbm: 2.5,
      isHazardous: false,
    });

    const hazardous = calculateRateCardQuote({
      corridor: "ASIA_EUROPE_WB",
      mode: "AIR",
      grossWeightKg: 500,
      totalCbm: 2.5,
      isHazardous: true,
    });

    expect(hazardous.hazardousSurcharge).toBeGreaterThan(0);
    expect(hazardous.netTotalAmount).toBeGreaterThan(normal.netTotalAmount);
  });
});
