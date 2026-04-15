import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { NavigationStackProvider } from "@/lib/NavigationStack";
import OnboardingModal from "@/components/radar/OnboardingModal";

const Radar    = lazy(() => import("./pages/Radar"));
const Contacts   = lazy(() => import("./pages/Contacts"));
const Settings   = lazy(() => import("./pages/Settings"));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-400 rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarded_v1"));

  if (isLoadingPublicSettings || isLoadingAuth) return <Spinner />;

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onDone={() => setShowOnboarding(false)} />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full"
        >
          <Suspense fallback={<Spinner />}>
            <Routes location={location}>
              <Route path="/"        element={<Navigate to="/Radar" replace />} />
              <Route path="/Radar"   element={<Radar />} />
              <Route path="/Contacts"   element={<Contacts />} />
              <Route path="/Settings"   element={<Settings />} />
              <Route path="*"           element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationStackProvider>
            <div className="mx-auto h-screen w-full max-w-4xl overflow-hidden bg-slate-950 shadow-2xl">
              <AuthenticatedApp />
            </div>
          </NavigationStackProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
