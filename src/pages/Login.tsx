import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, EyeOff, Brain } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { AppUser, UserRole } from '@/types/auth';
import { mapLegacyRole } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validatePassword } from "@/utils/passwordValidation";

interface LoginProps {
  onLogin: (user: AppUser) => void;
  onBack: () => void;
  onNavigate: (page: string) => void;
  language: string;
}

export default function Login({ onLogin, onBack, onNavigate, language }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'AUSZUBILDENDE_R' as UserRole,
    apprenticeship: '',
    company: ''
  });
  const { toast } = useToast();

  const getTexts = (lang: string) => {
    const texts = {
      de: {
        login: {
          title: 'Anmelden',
          subtitle: 'Willkommen zurück',
          description: 'Melde dich an, um mit ALINA zu lernen',
          email: 'E-Mail',
          password: 'Passwort',
          button: 'Anmelden',
          forgotPassword: 'Passwort vergessen?',
          resetPassword: 'Passwort zurücksetzen',
        },
        register: {
          title: 'Registrieren',
          subtitle: 'Account erstellen',
          description: 'Erstelle deinen ALINA Account',
          email: 'E-Mail',
          password: 'Passwort',
          confirmPassword: 'Passwort bestätigen',
          firstName: 'Vorname',
          lastName: 'Nachname',
          role: 'Rolle',
          apprenticeship: 'Ausbildungsberuf',
          company: 'Ausbildungsbetrieb',
          button: 'Registrieren',
        },
        roles: {
          student: 'Auszubildende/r',
          instructor: 'Ausbilder/in',
        },
        backToHome: 'Zurück zur Startseite',
      },
      en: {
        login: {
          title: 'Login',
          subtitle: 'Welcome Back',
          description: 'Log in to learn with ALINA',
          email: 'Email',
          password: 'Password',
          button: 'Login',
          forgotPassword: 'Forgot Password?',
          resetPassword: 'Reset Password',
        },
        register: {
          title: 'Register',
          subtitle: 'Create Account',
          description: 'Create your ALINA account',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          firstName: 'First Name',
          lastName: 'Last Name',
          role: 'Role',
          apprenticeship: 'Apprenticeship',
          company: 'Company',
          button: 'Register',
        },
        roles: {
          student: 'Student',
          instructor: 'Instructor',
        },
        backToHome: 'Back to Home',
      }
    };
    return texts[lang as keyof typeof texts] || texts.de;
  };

  const t = getTexts(language);

  const apprenticeshipOptions = [
    "Kfz-Mechatroniker/in",
    "Industriemechaniker/in",
    "Elektroniker/in",
    "Anlagenmechaniker/in",
    "Maurer/in",
    "Zimmerer/Zimmerin",
    "Tischler/in",
    "Maler/in und Lackierer/in"
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Anmeldung fehlgeschlagen",
            description: "E-Mail oder Passwort ist falsch. Bitte versuchen Sie es erneut.",
          });
        } else if (authError.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "E-Mail nicht bestätigt",
            description: "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrer E-Mail.",
          });
          onNavigate("verify-email");
          return;
        } else {
          toast({
            variant: "destructive",
            title: "Anmeldung fehlgeschlagen",
            description: authError.message,
          });
        }
        return;
      }

      if (!authData.user) return;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        toast({
          variant: "destructive",
          title: "Profil nicht gefunden",
          description: "Ihr Benutzerprofil konnte nicht geladen werden.",
        });
        return;
      }

      const user: AppUser = {
        id: authData.user.id,
        name: `${profile.first_name} ${profile.last_name}`,
        role: mapLegacyRole(profile.role),
        apprenticeship: profile.apprenticeship || '',
        email: authData.user.email || '',
      };

      onLogin(user);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unerwarteter Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced password validation
    const passwordValidation = validatePassword(registerData.password);
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Registrierung fehlgeschlagen",
        description: "Das Passwort entspricht nicht den Sicherheitsanforderungen.",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registrierung fehlgeschlagen",
        description: "Die Passwörter stimmen nicht überein.",
      });
      return;
    }

    if (!registerData.firstName || !registerData.lastName) {
      toast({
        variant: "destructive",
        title: "Registrierung fehlgeschlagen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    if (registerData.role === 'AUSZUBILDENDE_R' && !registerData.apprenticeship) {
      toast({
        variant: "destructive",
        title: "Registrierung fehlgeschlagen",
        description: "Bitte wählen Sie Ihren Ausbildungsgang aus.",
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            role: registerData.role,
            apprenticeship: registerData.apprenticeship,
            company: registerData.company,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Registrierung fehlgeschlagen",
            description: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Registrierung fehlgeschlagen",
            description: authError.message,
          });
        }
        return;
      }

      if (authData.user && !authData.session) {
        toast({
          title: "Registrierung erfolgreich!",
          description: "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrer E-Mail.",
        });
        onNavigate("verify-email");
        return;
      }

      if (authData.user && authData.session) {
        // Auto-login after registration (if email confirmation is disabled)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profile) {
          const user: AppUser = {
            id: authData.user.id,
            name: `${profile.first_name} ${profile.last_name}`,
            role: mapLegacyRole(profile.role),
            apprenticeship: profile.apprenticeship || '',
            email: authData.user.email || '',
          };
          onLogin(user);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unerwarteter Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-primary-foreground hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToHome}
        </Button>

        {/* Main Card */}
        <Card className="shadow-large border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mb-4">
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">ALINA</h1>
              <Badge variant="secondary" className="text-xs">
                Digitaler Ausbildungs-Buddy
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.login.title}</TabsTrigger>
                <TabsTrigger value="register">{t.register.title}</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center mb-6">
                  <CardTitle className="text-xl">{t.login.subtitle}</CardTitle>
                  <CardDescription className="mt-1">
                    {t.login.description}
                  </CardDescription>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.login.email}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="max.mustermann@beispiel.de"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.login.password}</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        placeholder="Dein Passwort"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-primary hover:underline p-0 h-auto"
                        onClick={() => onNavigate("reset-password")}
                      >
                        {t.login.forgotPassword}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {t.login.button}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-6">
                  <CardTitle className="text-xl">{t.register.subtitle}</CardTitle>
                  <CardDescription className="mt-1">
                    {t.register.description}
                  </CardDescription>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t.register.firstName}</Label>
                      <Input
                        id="firstName"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                        placeholder="Max"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t.register.lastName}</Label>
                      <Input
                        id="lastName"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                        placeholder="Mustermann"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t.register.email}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      placeholder="max.mustermann@beispiel.de"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">{t.register.role}</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) => setRegisterData({...registerData, role: value as UserRole})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUSZUBILDENDE_R">{t.roles.student}</SelectItem>
                        <SelectItem value="AUSBILDER_IN">{t.roles.instructor}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {registerData.role === 'AUSZUBILDENDE_R' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="apprenticeship">{t.register.apprenticeship}</Label>
                        <Select
                          value={registerData.apprenticeship}
                          onValueChange={(value) => setRegisterData({...registerData, apprenticeship: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wähle deinen Ausbildungsberuf" />
                          </SelectTrigger>
                          <SelectContent>
                            {apprenticeshipOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">{t.register.company}</Label>
                        <Input
                          id="company"
                          value={registerData.company}
                          onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
                          placeholder="Dein Ausbildungsbetrieb"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t.register.password}</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <PasswordStrengthIndicator password={registerData.password} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t.register.confirmPassword}</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {t.register.button}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}