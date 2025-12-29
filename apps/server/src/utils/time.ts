export const formatTimeTo12Hour = (timeString: string) => {
  const date = new Date(timeString);
  const h = date.getHours();
  const m = date.getMinutes();
  const month = date.toLocaleString('default', { month: 'short' });

  return `${month} ${date.getDate()} ${h % 12 || 12}:${m < 10 ? `0${m}` : m} ${
    h >= 12 ? 'PM' : 'AM'
  }`;
};

export function formatTurnover(amount: number | null): string {
  if (!amount || Number.isNaN(amount) || amount === 0) {
    return '-';
  }

  const kharba = 100_000_000_000; // 100 arab
  const arab = 1_000_000_000; // 100 crore
  const crore = 10_000_000; // 1 crore
  const lakh = 100_000; // 1 lakh
  const hajar = 1000; // 1 hajar

  if (amount >= kharba) {
    const kharbaValue = Math.floor((amount / kharba) * 10) / 10;
    return `${kharbaValue.toFixed(1)} Kharba`;
  }

  if (amount >= arab) {
    const arabValue = Math.floor((amount / arab) * 10) / 10;
    return `${arabValue.toFixed(1)} Arba`;
  }

  if (amount >= crore) {
    const croreValue = Math.floor((amount / crore) * 10) / 10;
    return `${croreValue.toFixed(1)} Crore`;
  }

  if (amount >= lakh) {
    const lakhValue = Math.floor((amount / lakh) * 10) / 10;
    return `${lakhValue.toFixed(1)} Lakh`;
  }

  const hajarValue = Math.floor((amount / hajar) * 10) / 10;
  return `${hajarValue.toFixed(1)} Hajar`;
}

export function formatNumber(
  value: number | string | null | undefined
): string {
  if (value === '-') {
    return '-';
  }

  if (
    value === null ||
    value === undefined ||
    (Number.isNaN(value) && typeof value !== 'string') ||
    (typeof value === 'number' && !Number.isFinite(value))
  ) {
    return '-';
  }

  const num = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return '-';
  }
  const truncated = Math.floor(num * 100) / 100;
  return truncated.toString();
}

export const NepalTime = new Date()
  .toLocaleString('sv-SE', { timeZone: 'Asia/Kathmandu' })
  .replace(' ', 'T');
