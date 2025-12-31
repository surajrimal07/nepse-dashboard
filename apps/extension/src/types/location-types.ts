import z from '@nepse-dashboard/zod'

export const geoLocationSchema = z.object({
  ip: z.string(),
  city_name: z.string(),
  region_name: z.string(),
  country_name: z.string(),
})

export type GeoLocation = z.infer<typeof geoLocationSchema>

export interface LocationData {
  ip: string
  city_name: string
  region_name: string
  country_name: string
}
