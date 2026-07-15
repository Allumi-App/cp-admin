import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/features/auth/auth-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Christina Pfeiffer dashboard
import { CpSectionsPage } from '@/features/cp/sections/cp-sections-page'
import { CpAboutPage } from '@/features/cp/about/cp-about-page'
import { CpApproachPage } from '@/features/cp/approach/cp-approach-page'
import { CpEcosystemPage } from '@/features/cp/ecosystem/cp-ecosystem-page'
import { CpTestimonialsPage } from '@/features/cp/testimonials/cp-testimonials-page'
import { CpFaqPage } from '@/features/cp/faq/cp-faq-page'
import { CpLegalPage } from '@/features/cp/legal/cp-legal-page'
import { CpLegalEditPage } from '@/features/cp/legal/cp-legal-edit-page'
import { CpPackagesPage } from '@/features/cp/packages/cp-packages-page'
import { CpSocialLinksPage } from '@/features/cp/social-links/cp-social-links-page'
import { CpStoreLinksPage } from '@/features/cp/store-links/cp-store-links-page'
import { CpShowPage } from '@/features/cp/show/cp-show-page'
import { CpRequestsPage } from '@/features/cp/requests/cp-requests-page'
import { CpEmailTemplatesPage } from '@/features/cp/email-templates/cp-email-templates-page'
import { CpSubscribersPage } from '@/features/cp/subscribers/cp-subscribers-page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/cp/packages" replace />} />
              <Route path="/cp" element={<Navigate to="/cp/packages" replace />} />

              <Route path="/cp/packages" element={<CpPackagesPage />} />
              <Route path="/cp/requests" element={<CpRequestsPage />} />
              <Route path="/cp/email-templates" element={<CpEmailTemplatesPage />} />
              <Route path="/cp/subscribers" element={<CpSubscribersPage />} />
              <Route path="/cp/sections" element={<CpSectionsPage />} />
              <Route path="/cp/about" element={<CpAboutPage />} />
              <Route path="/cp/approach" element={<CpApproachPage />} />
              <Route path="/cp/ecosystem" element={<CpEcosystemPage />} />
              <Route path="/cp/testimonials" element={<CpTestimonialsPage />} />
              <Route path="/cp/store-links" element={<CpStoreLinksPage />} />
              <Route path="/cp/show" element={<CpShowPage />} />
              <Route path="/cp/faq" element={<CpFaqPage />} />
              <Route path="/cp/social-links" element={<CpSocialLinksPage />} />
              <Route path="/cp/legal" element={<CpLegalPage />} />
              <Route path="/cp/legal/:id" element={<CpLegalEditPage />} />
            </Route>

            {/* Fallback: anything unknown lands on the dashboard. */}
            <Route path="*" element={<Navigate to="/cp/packages" replace />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: { fontFamily: "'Inter', sans-serif" },
        }}
      />
    </QueryClientProvider>
  )
}
