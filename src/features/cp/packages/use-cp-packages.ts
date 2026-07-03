import { makeCpListHooks, type CpListRow } from '../lib/make-list-hooks'

export interface CpPackage extends CpListRow {
  slug: string | null
  price_cents: number
  currency: string
  session_count: number
  duration: number
  segment: string | null
  segment_de: string | null
  name: string | null
  name_de: string | null
  description: string | null
  description_de: string | null
  included: string[]
  included_de: string[]
  is_visible: boolean
}

export const packagesHooks = makeCpListHooks<CpPackage>('packages', 'Package')
