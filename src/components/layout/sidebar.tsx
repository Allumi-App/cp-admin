import { useState, type ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  FileText,
  Link2,
  LogOut,
  Globe,
  ChevronDown,
  ChevronRight,
  Layout,
  User,
  Download,
  HelpCircle,
  Mail,
  Compass,
  Quote,
  Tag,
  Podcast,
  Inbox,
  Users,
} from 'lucide-react'
import { useCpNewRequestCount } from '@/features/cp/requests/use-cp-requests'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const NAV: { top: NavItem[]; website: NavItem[]; email: NavItem[] } = {
  top: [
    { to: '/cp/packages', label: 'Packages', icon: Tag },
    { to: '/cp/requests', label: 'Requests', icon: Inbox },
    { to: '/cp/legal', label: 'Legal Documents', icon: FileText },
    { to: '/cp/social-links', label: 'Social Links', icon: Link2 },
  ],
  email: [
    { to: '/cp/email-templates', label: 'Templates', icon: Mail },
    { to: '/cp/subscribers', label: 'Subscribers', icon: Users },
  ],
  website: [
    { to: '/cp/sections', label: 'Page Sections', icon: Layout },
    { to: '/cp/about', label: 'About', icon: User },
    { to: '/cp/approach', label: 'Coaching Pillars', icon: Compass },
    { to: '/cp/testimonials', label: 'Testimonials', icon: Quote },
    { to: '/cp/store-links', label: 'Store Links', icon: Download },
    { to: '/cp/show', label: 'The Show', icon: Podcast },
    { to: '/cp/faq', label: 'FAQ', icon: HelpCircle },
  ],
}

const topClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/[0.06] text-foreground font-semibold'
      : 'text-muted-foreground hover:bg-black/[0.08] hover:text-foreground',
  )

const subClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/[0.06] text-foreground font-semibold'
      : 'text-muted-foreground hover:bg-black/[0.08] hover:text-foreground',
  )

export function Sidebar() {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const { data: newRequestCount } = useCpNewRequestCount()

  const nav = NAV
  const emailItems = nav.email
  const isEmailActive = emailItems.some((i) => location.pathname.startsWith(i.to))
  const [emailOpen, setEmailOpen] = useState(isEmailActive)
  const isWebsiteActive = nav.website.some((i) => location.pathname.startsWith(i.to))
  const [websiteOpen, setWebsiteOpen] = useState(isWebsiteActive)

  return (
    <aside className="w-[280px] bg-white border-r border-gray-300 flex flex-col h-screen sticky top-0">
      <div className="h-20 px-5 flex items-center border-b border-gray-300">
        <span className="font-serif text-[22px] font-bold tracking-[-0.02em] text-foreground">
          Christina <span className="text-[#C6A15B]">Pfeiffer</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.top.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={topClass}>
            <Icon className="w-5 h-5" />
            <span className="flex-1">{label}</span>
            {to === '/cp/requests' && !!newRequestCount && (
              <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                {newRequestCount}
              </span>
            )}
          </NavLink>
        ))}

        {emailItems.length > 0 && (
          <>
            <button
              onClick={() => setEmailOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                isEmailActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-black/[0.08] hover:text-foreground',
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="flex-1 text-left">Email</span>
              {emailOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {emailOpen && (
              <div className="ml-3 space-y-0.5">
                {emailItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={subClass}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setWebsiteOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
            isWebsiteActive
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:bg-black/[0.08] hover:text-foreground',
          )}
        >
          <Globe className="w-5 h-5" />
          <span className="flex-1 text-left">Website</span>
          {websiteOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {websiteOpen && (
          <div className="ml-3 space-y-0.5">
            {nav.website.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={subClass}>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-300 flex items-center justify-between">
        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        <button
          onClick={signOut}
          title="Sign out"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 text-muted-foreground hover:text-foreground hover:bg-black/[0.08] transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
