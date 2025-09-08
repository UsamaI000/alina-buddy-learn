import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ChatInterface from "./components/ChatInterface";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

interface AppUser {
  name: string;
  role: "student" | "instructor" | "admin";
  apprenticeship: string;
}

const App = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState("de");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (profile) {
              const appUser: AppUser = {
                name: `${profile.first_name} ${profile.last_name}`,
                role: profile.role as "student" | "instructor" | "admin",
                apprenticeship: profile.apprenticeship || ""
              };
              setCurrentUser(appUser);
              setCurrentPage("dashboard");
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setCurrentPage("home");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
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
    switch (currentPage) {
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
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
            <div className="flex-1">
              <ChatInterface language={currentLanguage} />
            </div>
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
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
            <Dashboard user={currentUser} language={currentLanguage} />
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
            language={currentLanguage}
          />
        );
      case "instructor":
        return currentUser?.role === "instructor" ? (
          <div>
            <Navigation
              currentUser={currentUser}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLanguageChange={setCurrentLanguage}
              currentLanguage={currentLanguage}
            />
            <Dashboard user={currentUser} language={currentLanguage} />
          </div>
        ) : (
          <Login
            onLogin={handleLogin}
            onBack={() => setCurrentPage("home")}
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
