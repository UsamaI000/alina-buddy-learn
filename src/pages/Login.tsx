import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (user: { name: string; role: "student" | "instructor"; apprenticeship: string }) => void;
  onBack: () => void;
  language: string;
}

export default function Login({ onLogin, onBack, language }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "student" as "student" | "instructor",
    apprenticeship: "",
    company: ""
  });
  const { toast } = useToast();

  const getTexts = (lang: string) => {
    const texts = {
      de: {
        login: "Anmelden",
        register: "Registrieren",
        email: "E-Mail",
        password: "Passwort",
        confirmPassword: "Passwort bestätigen",
        firstName: "Vorname",
        lastName: "Nachname",
        role: "Rolle",
        student: "Auszubildende/r",
        instructor: "Ausbilder/in",
        apprenticeship: "Ausbildungsberuf",
        company: "Ausbildungsbetrieb",
        loginButton: "Anmelden",
        registerButton: "Registrieren",
        welcomeBack: "Willkommen zurück",
        createAccount: "Account erstellen",
        backToHome: "Zurück zur Startseite",
        loginSuccess: "Erfolgreich angemeldet!",
        registerSuccess: "Account erfolgreich erstellt!"
      },
      en: {
        login: "Login",
        register: "Register",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        firstName: "First Name",
        lastName: "Last Name",
        role: "Role",
        student: "Student",
        instructor: "Instructor",
        apprenticeship: "Apprenticeship",
        company: "Company",
        loginButton: "Login",
        registerButton: "Register",
        welcomeBack: "Welcome Back",
        createAccount: "Create Account",
        backToHome: "Back to Home",
        loginSuccess: "Successfully logged in!",
        registerSuccess: "Account created successfully!"
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    const mockUser = {
      name: "Max Mustermann",
      role: "student" as const,
      apprenticeship: "Kfz-Mechatroniker/in"
    };
    
    toast({
      title: t.loginSuccess,
      description: `Willkommen zurück, ${mockUser.name}!`
    });
    
    onLogin(mockUser);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein",
        variant: "destructive"
      });
      return;
    }
    
    const newUser = {
      name: `${registerData.firstName} ${registerData.lastName}`,
      role: registerData.role,
      apprenticeship: registerData.apprenticeship || "Kfz-Mechatroniker/in"
    };
    
    toast({
      title: t.registerSuccess,
      description: `Willkommen bei ALINA, ${newUser.name}!`
    });
    
    onLogin(newUser);
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
              <h1 className="text-2xl font-bold text-primary mb-2">ALINA</h1>
              <Badge variant="secondary" className="text-xs">
                Digitaler Ausbildungs-Buddy
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.login}</TabsTrigger>
                <TabsTrigger value="register">{t.register}</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">{t.welcomeBack}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Melde dich an, um mit ALINA zu lernen
                  </p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
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
                    <Label htmlFor="login-password">{t.password}</Label>
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
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" variant="hero" className="w-full">
                    {t.loginButton}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">{t.createAccount}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Erstelle deinen ALINA Account
                  </p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t.firstName}</Label>
                      <Input
                        id="firstName"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                        placeholder="Max"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t.lastName}</Label>
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
                    <Label htmlFor="register-email">{t.email}</Label>
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
                    <Label htmlFor="role">{t.role}</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) => setRegisterData({...registerData, role: value as "student" | "instructor"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">{t.student}</SelectItem>
                        <SelectItem value="instructor">{t.instructor}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apprenticeship">{t.apprenticeship}</Label>
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
                  
                  {registerData.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="company">{t.company}</Label>
                      <Input
                        id="company"
                        value={registerData.company}
                        onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
                        placeholder="Dein Ausbildungsbetrieb"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t.password}</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      placeholder="Wähle ein sicheres Passwort"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      placeholder="Passwort wiederholen"
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="hero" className="w-full">
                    {t.registerButton}
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