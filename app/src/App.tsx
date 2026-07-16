import MainLayout from "@/components/layout/MainLayout";
import LoadingFallback from "@/components/shared/LoadingFallback";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useAppStore } from "@/store";
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import BalanceSheetSolver from "./components/balance-sheet-solver/BalanceSheetSolver";

// Lazy-loaded pages and components
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const JournalEntryForm = lazy(
  () => import("@/components/journal-entry/JournalEntryForm"),
);
const TrialBalanceForm = lazy(
  () => import("@/components/trial-balance/TrialBalanceForm"),
);
const ICItemSolver = lazy(
  () => import("@/components/ic-item-solver/ICItemSolver"),
);
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const ExternalJEParserRoute = lazy(
  () =>
    import(
      "@/components/journal-entry/external-je/ExternalJEParserRoute"
    ),
);

function ProtectedRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  return isAuthenticated ? (
    <Navigate to="/journal-entry" replace />
  ) : (
    <Outlet />
  );
}

/**
 * Main App Component
 * Sets up React Router with all available routes
 */
export default function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Handle auth redirects centrally
  useAuthRedirect();

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

              {/* External JE hub redirects to Email Body Parser */}
              <Route
                path="/journal-entry/external-jes"
                element={<Navigate to="/journal-entry/external-jes/email-body" replace />}
              />

              {/* External JE parser sub-routes — driven by ExternalJEParserRoute */}
              <Route
                path="/journal-entry/external-jes/email-body"
                element={<ExternalJEParserRoute />}
              />
              <Route
                path="/journal-entry/external-jes/email-attachment"
                element={<ExternalJEParserRoute />}
              />

              <Route
                path="/journal-entry/:result"
                element={<JournalEntryForm />}
              />
              <Route path="/trial-balance" element={<TrialBalanceForm />} />
              <Route path="/ic-item-solver" element={<ICItemSolver />} />
              <Route path="/report-preparer" element={<ComingSoonPage />} />
              <Route
                path="/balance-sheet-solver"
                element={<BalanceSheetSolver />}
              />
            </Route>
          </Route>

          {/* Catch-all 404 route */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/journal-entry" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
