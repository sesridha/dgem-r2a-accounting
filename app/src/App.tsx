import MainLayout from '@/components/layout/MainLayout'
import LoadingFallback from '@/components/shared/LoadingFallback'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { useAppStore } from '@/store'
import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const JournalEntryForm = lazy(() => import('@/components/journal-entry/JournalEntryForm'))
const TrialBalanceForm = lazy(() => import('@/components/trial-balance/TrialBalanceForm'))
const ICItemSolver = lazy(() => import('@/components/ic-item-solver/ICItemSolver'))
const BalanceSheetSolver = lazy(() => import('@/components/balance-sheet-solver/BalanceSheetSolver'))
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'))

function ProtectedRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnlyRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/journal-entry" replace /> : <Outlet />
}

export default function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  useAuthRedirect()

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/journal-entry" replace />} />
              <Route path="/journal-entry" element={<JournalEntryForm />} />
              <Route path="/journal-entry/:result" element={<JournalEntryForm />} />
              <Route path="/trial-balance" element={<TrialBalanceForm />} />
              <Route path="/ic-item-solver" element={<ICItemSolver />} />
              <Route path="/report-preparer" element={<ComingSoonPage />} />
              <Route path="/balance-sheet-solver" element={<BalanceSheetSolver />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/journal-entry' : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}