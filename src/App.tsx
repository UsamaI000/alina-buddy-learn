import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ChatInterface from "./components/ChatInterface";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import AzubiHome from "./pages/azubi/AzubiHome";
import LearningModules from "./pages/azubi/LearningModules";
import Calendar_Page from "./pages/azubi/Calendar";
import AusbilderDashboard from "./pages/ausbilder/AusbilderDashboard";
import { RouteGuard } from "./components/RouteGuard";
import { ProfileCompletionBanner } from "./components/auth/ProfileCompletionBanner";
import { WelcomeTour } from "./components/auth/WelcomeTour";
import { useAuthSession } from "./hooks/useAuthSession";
import type { AppUser, UserRole } from "@/types/auth";
import { getRoleBasedRedirect } from "@/utils/auth";

const queryClient = new QueryClient();

const App = () => {
  const { user: currentUser, session, loading, signOut } = useAuthSession();
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState("de");
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  useEffect(() => {
    if (currentUser && !loading) {
      // Check if user just logged in and should see welcome tour
      const hasSeenTour = localStorage.getItem(`alina_tour_completed_${currentUser.id}`) === 'true';
      if (!hasSeenTour) {
        setShowWelcomeTour(true);
      }

      // Auto-redirect to role-specific dashboard if on home page
      if (currentPage === "home") {
        const redirectPath = getRoleBasedRedirect(currentUser.role);
        setCurrentPage(redirectPath === '/azubi/home' ? 'azubi-home' : 'ausbilder-dashboard');
      }
    }
  }, [currentUser, loading, currentPage]);

  const handleLogin = (user: AppUser) => {
    // Login is now handled by useAuthSession hook
    const redirectPath = getRoleBasedRedirect(user.role);
    setCurrentPage(redirectPath === '/azubi/home' ? 'azubi-home' : 'ausbilder-dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage("home");
  };

  const handleNavigate = (page: string) => {
    if (page === "login" && currentUser) {
      handleLogout();
      return;
    }
    setCurrentPage(page);
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

  const renderPage = () => {
    // Show profile completion banner for authenticated pages
    const showProfileBanner = currentUser && !['login', 'reset-password', 'verify-email', 'home', 'profile'].includes(currentPage);

    switch (currentPage) {
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            onNavigate={handleNavigate}
            language={currentLanguage}
          />
        );
      case "reset-password":
        return (
          <ResetPassword 
            onBack={() => setCurrentPage("login")} 
            language={currentLanguage} 
          />
        );
      case "verify-email":
        return (
          <VerifyEmail 
            onBack={() => setCurrentPage("login")} 
            language={currentLanguage} 
          />
        );
      case "profile":
        return currentUser ? (
          <div>
            <Navigation
              currentUser={currentUser}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLanguageChange={setCurrentLanguage}
              currentLanguage={currentLanguage}
            />
            <Profile user={currentUser} language={currentLanguage} />
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            onNavigate={handleNavigate}
            language={currentLanguage}
          />
        );
      case "chat":
        return currentUser ? (
          <div className="h-screen flex flex-col">
            <Navigation
              currentUser={currentUser}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLanguageChange={setCurrentLanguage}
              currentLanguage={currentLanguage}
            />
            {showProfileBanner && (
              <div className="container mx-auto px-4 pt-4">
                <ProfileCompletionBanner
                  user={currentUser}
                  onNavigateToProfile={() => setCurrentPage("profile")}
                  language={currentLanguage}
                />
              </div>
            )}
            <div className="flex-1">
              <ChatInterface language={currentLanguage} />
            </div>
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            onNavigate={handleNavigate}
            language={currentLanguage}
          />
        );
      case "dashboard":
        return currentUser ? (
          <div>
            <Navigation
              currentUser={currentUser}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLanguageChange={setCurrentLanguage}
              currentLanguage={currentLanguage}
            />
            {showProfileBanner && (
              <div className="container mx-auto px-4 pt-4">
                <ProfileCompletionBanner
                  user={currentUser}
                  onNavigateToProfile={() => setCurrentPage("profile")}
                  language={currentLanguage}
                />
              </div>
            )}
            <Dashboard user={currentUser} language={currentLanguage} />
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            onNavigate={handleNavigate}
            language={currentLanguage}
          />
        );
      case "azubi-home":
        return (
          <RouteGuard requiredRoles={['AUSZUBILDENDE_R']}>
            <div>
              <Navigation
                currentUser={currentUser}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLanguageChange={setCurrentLanguage}
                currentLanguage={currentLanguage}
              />
              {showProfileBanner && (
                <div className="container mx-auto px-4 pt-4">
                  <ProfileCompletionBanner
                    user={currentUser!}
                    onNavigateToProfile={() => setCurrentPage("profile")}
                    language={currentLanguage}
                  />
                </div>
              )}
              <AzubiHome user={currentUser!} language={currentLanguage} />
            </div>
          </RouteGuard>
        );
      case "azubi-learning-modules":
        return (
          <RouteGuard requiredRoles={['AUSZUBILDENDE_R']}>
            <div>
              <Navigation
                currentUser={currentUser}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLanguageChange={setCurrentLanguage}
                currentLanguage={currentLanguage}
              />
              {showProfileBanner && (
                <div className="container mx-auto px-4 pt-4">
                  <ProfileCompletionBanner
                    user={currentUser!}
                    onNavigateToProfile={() => setCurrentPage("profile")}
                    language={currentLanguage}
                  />
                </div>
              )}
              <LearningModules user={currentUser!} language={currentLanguage} />
            </div>
          </RouteGuard>
        );
      case "azubi-calendar":
        return (
          <RouteGuard requiredRoles={['AUSZUBILDENDE_R']}>
            <div>
              <Navigation
                currentUser={currentUser}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLanguageChange={setCurrentLanguage}
                currentLanguage={currentLanguage}
              />
              {showProfileBanner && (
                <div className="container mx-auto px-4 pt-4">
                  <ProfileCompletionBanner
                    user={currentUser!}
                    onNavigateToProfile={() => setCurrentPage("profile")}
                    language={currentLanguage}
                  />
                </div>
              )}
              <Calendar_Page user={currentUser!} language={currentLanguage} />
            </div>
          </RouteGuard>
        );
      case "ausbilder-dashboard":
        return (
          <RouteGuard requiredRoles={['AUSBILDER_IN']}>
            <div>
              <Navigation
                currentUser={currentUser}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLanguageChange={setCurrentLanguage}
                currentLanguage={currentLanguage}
              />
              {showProfileBanner && (
                <div className="container mx-auto px-4 pt-4">
                  <ProfileCompletionBanner
                    user={currentUser!}
                    onNavigateToProfile={() => setCurrentPage("profile")}
                    language={currentLanguage}
                  />
                </div>
              )}
              <AusbilderDashboard user={currentUser!} language={currentLanguage} />
            </div>
          </RouteGuard>
        );
      case "instructor":
        // Legacy route - redirect to new route
        return currentUser?.role === "AUSBILDER_IN" ? (
          <div>
            <Navigation
              currentUser={currentUser}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLanguageChange={setCurrentLanguage}
              currentLanguage={currentLanguage}
            />
            <AusbilderDashboard user={currentUser} language={currentLanguage} />
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            onNavigate={handleNavigate}
            language={currentLanguage}
          />
        );
      case "home":
      default:
        return (
          <Index
            onNavigate={handleNavigate}
            onLanguageChange={setCurrentLanguage}
            currentLanguage={currentLanguage}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={renderPage()} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {showWelcomeTour && currentUser && (
            <WelcomeTour
              user={currentUser}
              language={currentLanguage}
              onComplete={() => setShowWelcomeTour(false)}
            />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
