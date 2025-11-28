import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ChatInterface from "./components/ChatInterface";
import NotFound from "./pages/NotFound";
import AzubiHome from "./pages/azubi/AzubiHome";
import LearningModules from "./pages/azubi/LearningModules";
import Calendar_Page from "./pages/azubi/Calendar";
import AusbilderDashboard from "./pages/ausbilder/AusbilderDashboard";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { WelcomeTour } from "./components/auth/WelcomeTour";
import { useAuthSession } from "./hooks/useAuthSession";
import type { AppUser } from "@/types/auth";
import { getRoleBasedRedirect } from "@/utils/auth";
// Import the new pages
import NotebooksDashboard from "./pages/NotebooksDashboard";
import Notebook from "./pages/Notebook";

const queryClient = new QueryClient();

function AppContent() {
  const { user: currentUser, session, loading, signOut } = useAuthSession();
  const [currentLanguage, setCurrentLanguage] = useState("de");
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && !loading) {
      // Check if user just logged in and should see welcome tour
      const hasSeenTour = localStorage.getItem(`alina_tour_completed_${currentUser.id}`) === 'true';
      if (!hasSeenTour) {
        setShowWelcomeTour(true);
      }

      // Auto-redirect from public pages to role-specific dashboard
      const publicPaths = ['/', '/login', '/reset-password', '/verify-email'];
      if (publicPaths.includes(location.pathname)) {
        const redirectPath = getRoleBasedRedirect(currentUser.role);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [currentUser, loading, location.pathname, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">ALINA</h1>
          <p className="text-primary-foreground/80">Lädt...</p>
        </div>
      </div>
    );
  }

  const showProfileBanner = currentUser && !['/login', '/reset-password', '/verify-email', '/', '/profile'].includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index onLanguageChange={setCurrentLanguage} currentLanguage={currentLanguage} />} />
        <Route path="/login" element={<Login language={currentLanguage} />} />
        <Route path="/reset-password" element={<ResetPassword language={currentLanguage} />} />
        <Route path="/verify-email" element={<VerifyEmail language={currentLanguage} />} />

        {/* Protected Routes with Layout */}
        {currentUser && (
          <Route element={<AppLayout currentUser={currentUser} currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} showProfileBanner={!!showProfileBanner} />}>
            {/* Common authenticated routes */}
            <Route path="/profile" element={<Profile user={currentUser} language={currentLanguage} />} />
            {/* --- REPLACED CHAT WITH NOTEBOOKS --- */}
            <Route path="/notebooks" element={<NotebooksDashboard />} />
            <Route path="/notebook/:notebookId" element={<Notebook />} />

            {/* Azubi Routes */}
            <Route element={<ProtectedRoute requiredRoles={['AUSZUBILDENDE_R']} isAuthenticated={!!currentUser} />}>
              <Route path="/azubi/home" element={<AzubiHome user={currentUser} language={currentLanguage} />} />
              <Route path="/azubi/learning-modules" element={<LearningModules user={currentUser} language={currentLanguage} />} />
              <Route path="/azubi/calendar" element={<Calendar_Page user={currentUser} language={currentLanguage} />} />
            </Route>

            {/* Ausbilder Routes */}
            <Route element={<ProtectedRoute requiredRoles={['AUSBILDER_IN']} isAuthenticated={!!currentUser} />}>
              <Route path="/ausbilder/dashboard" element={<AusbilderDashboard user={currentUser} language={currentLanguage} />} />
            </Route>
          </Route>
        )}

        {/* Fallback for protected routes when not authenticated */}
        {!currentUser && (
          <>
            <Route path="/profile" element={<Navigate to="/login" replace />} />
            {/* 2. ADD THESE NEW ROUTES */}
            <Route path="/notebooks" element={<NotebooksDashboard />} />
            <Route path="/notebook/:notebookId" element={<Notebook />} />
            <Route path="/azubi/*" element={<Navigate to="/login" replace />} />
            <Route path="/ausbilder/*" element={<Navigate to="/login" replace />} />
          </>
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>

      {showWelcomeTour && currentUser && (
        <WelcomeTour
          user={currentUser}
          language={currentLanguage}
          onComplete={() => setShowWelcomeTour(false)}
        />
      )}
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
