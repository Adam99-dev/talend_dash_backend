export const CURRENCY_CONVERSION = {
  "INR_TO_USD": 0.012, // ₹100 = $1.20 approx
  "USD_TO_INR": 83.3,
} as const;

export type Currency = "INR" | "USD";

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "INR") {
    return formatINR(amount);
  }
  return formatUSD(amount);
}

function formatINR(amount: number): string {
  if (amount === 0) return "₹0";

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 10000000) {
    // Crore
    const crore = absAmount / 10000000;
    return `${sign}₹${crore.toFixed(2).replace(/\.0+$/, "")}Cr`;
  }

  if (absAmount >= 100000) {
    // Lakh
    const lakh = absAmount / 100000;
    return `${sign}₹${lakh.toFixed(2).replace(/\.0+$/, "")}L`;
  }

  return `${sign}₹${absAmount.toLocaleString("en-IN")}`;
}

function formatUSD(amount: number): string {
  if (amount === 0) return "$0";

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  return `${sign}$${absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;

  if (fromCurrency === "INR" && toCurrency === "USD") {
    return Math.round(amount * CURRENCY_CONVERSION.INR_TO_USD);
  }

  if (fromCurrency === "USD" && toCurrency === "INR") {
    return Math.round(amount * CURRENCY_CONVERSION.USD_TO_INR);
  }

  return amount;
}

export function getDashIfMissing(value: number | null | undefined): string {
  return value === null || value === undefined || value === 0 ? "—" : "";
}
