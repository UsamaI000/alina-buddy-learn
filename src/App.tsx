import { useState } from "react";
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

const queryClient = new QueryClient();

interface User {
  name: string;
  role: "student" | "instructor" | "admin";
  apprenticeship: string;
}

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState("de");

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
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
