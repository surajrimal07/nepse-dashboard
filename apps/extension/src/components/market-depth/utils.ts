export function getBadgeClassName(percentageChange: number) {
  return percentageChange > 0
    ? 'text-green-500'
    : percentageChange < 0
      ? 'text-red-500'
      : 'text-muted-foreground'
}
