export function calculateChartColor(data: [number, number][]): string {
  if (data.length < 2) {
    return '#22c55e';
  }

  const lastPrice = data.at(-1)?.[1] ?? 0;
  const firstPrice = data[0][1];

  return lastPrice >= firstPrice ? '#22c55e' : '#ef4444';
}
