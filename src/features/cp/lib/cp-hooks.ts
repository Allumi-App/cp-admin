import { makeCpListHooks, type CpListRow } from './make-list-hooks'

export interface CpTestimonial extends CpListRow {
  quote: string | null
  quote_de: string | null
  name: string | null
  tag: string | null
  tag_de: string | null
}

export interface CpAboutStat extends CpListRow {
  value: string | null
  label: string | null
  label_de: string | null
}

export interface CpApproachPillar extends CpListRow {
  label: string | null
  label_de: string | null
  title: string | null
  title_de: string | null
  body: string | null
  body_de: string | null
}

export interface CpFaqItem extends CpListRow {
  question: string | null
  question_de: string | null
  answer: string | null
  answer_de: string | null
  is_visible: boolean
}

export interface CpSocialLink extends CpListRow {
  platform: string | null
  title: string | null
  url: string | null
}

export interface CpStoreLink extends CpListRow {
  platform: string | null
  url: string | null
  badge_image_url: string | null
}

export interface CpShowPlatform extends CpListRow {
  platform: string | null
  url: string | null
}

export interface CpEcosystemCard extends CpListRow {
  product: string | null
  title: string | null
  title_de: string | null
  description: string | null
  description_de: string | null
  cta_label: string | null
  cta_label_de: string | null
  url: string | null
  image_url: string | null
}

export const testimonialsHooks = makeCpListHooks<CpTestimonial>('testimonials', 'Testimonial')
export const aboutStatsHooks = makeCpListHooks<CpAboutStat>('about_stats', 'Stat')
export const approachPillarsHooks = makeCpListHooks<CpApproachPillar>('approach_pillars', 'Pillar')
export const faqHooks = makeCpListHooks<CpFaqItem>('faq_items', 'FAQ item')
export const socialLinksHooks = makeCpListHooks<CpSocialLink>('social_links', 'Social link')
export const storeLinksHooks = makeCpListHooks<CpStoreLink>('store_links', 'Store link')
export const showPlatformsHooks = makeCpListHooks<CpShowPlatform>('show_platforms', 'Platform')
export const ecosystemCardsHooks = makeCpListHooks<CpEcosystemCard>('ecosystem_cards', 'Product card')
