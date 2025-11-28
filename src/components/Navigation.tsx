import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Globe,
  LogOut,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AppUser } from "@/types/auth";
import { NAV_CONFIG } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getTranslation, type Language } from "@/utils/i18n";

interface NavigationProps {
  currentUser?: AppUser;
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

const languages = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
];

export default function Navigation({ 
  currentUser, 
  onLanguageChange,
  currentLanguage 
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const t = getTranslation('navigation', currentLanguage as Language);

  const getNavItems = () => {
    if (!currentUser) return [];
    
    return NAV_CONFIG.filter(item => 
      item.allowedRoles.includes(currentUser.role)
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const getTranslatedLabel = (itemId: string) => {
    const labelMap: Record<string, string> = {
      'azubi-home': t.myArea,
      'azubi-learning-modules': t.learningModules,
      'azubi-calendar': t.calendar,
      'ausbilder-dashboard': t.instructorDashboard,
      'notebooks': "Notebooks", // Or t.notebooks if you add it to translations,
    };
    return labelMap[itemId] || itemId;
  };

  const NavItems = ({ mobile = false }) => (
    <>
      {getNavItems().map((item) => (
        <Button
          key={item.id}
          variant={location.pathname === item.path ? "default" : "ghost"}
          onClick={() => {
            navigate(item.path);
            if (mobile) setIsOpen(false);
          }}
          className={mobile ? "w-full justify-start" : ""}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {getTranslatedLabel(item.id)}
        </Button>
      ))}
    </>
  );

  return (
    <nav className="border-b bg-card shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-xl font-bold text-primary hover:bg-transparent"
            >
              ALINA
            </Button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 space-x-2">
              <NavItems />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {languages.find(l => l.code === currentLanguage)?.flag}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={currentLanguage === lang.code ? "bg-muted" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/login")}>
                {t.login}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}