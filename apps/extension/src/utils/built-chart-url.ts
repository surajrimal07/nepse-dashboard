import { DEFAULT_CHART_SITES } from '@/constants/app-config'

export function buildChartUrl({
  chartSite,
  customUrl,
  symbol,
}: {
  chartSite: string
  customUrl?: string
  symbol: string
}): string {
  if (chartSite === 'custom' && customUrl) {
    return `${customUrl}${symbol.toUpperCase()}`
  }

  const selectedSite = DEFAULT_CHART_SITES.find(s => s.id === chartSite)
  const baseUrl = selectedSite?.url || DEFAULT_CHART_SITES[0].url

  return `${baseUrl}${symbol.toUpperCase()}`
}
