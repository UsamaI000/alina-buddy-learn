import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validatePassword } from "@/utils/passwordValidation";

interface ResetPasswordProps {
  onBack: () => void;
  language: string;
}

export default function ResetPassword({ onBack, language }: ResetPasswordProps) {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const getTexts = (lang: string) => {
    const texts = {
      de: {
        title: 'Passwort zurücksetzen',
        description: 'Geben Sie Ihre E-Mail-Adresse ein, um ein neues Passwort anzufordern',
        resetTitle: 'Neues Passwort setzen',
        resetDescription: 'Geben Sie Ihr neues Passwort ein',
        email: 'E-Mail',
        password: 'Neues Passwort',
        confirmPassword: 'Passwort bestätigen',
        sendReset: 'Reset-Link senden',
        resetPassword: 'Passwort zurücksetzen',
        backToLogin: 'Zur Anmeldung',
        emailSent: 'Reset-Link wurde an Ihre E-Mail-Adresse gesendet',
        passwordMismatch: 'Passwörter stimmen nicht überein',
        weakPassword: 'Passwort entspricht nicht den Sicherheitsanforderungen',
        resetSuccess: 'Passwort wurde erfolgreich zurückgesetzt',
        resetError: 'Fehler beim Zurücksetzen des Passworts',
        invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      en: {
        title: 'Reset Password',
        description: 'Enter your email address to request a new password',
        resetTitle: 'Set New Password',
        resetDescription: 'Enter your new password',
        email: 'Email',
        password: 'New Password',
        confirmPassword: 'Confirm Password',
        sendReset: 'Send Reset Link',
        resetPassword: 'Reset Password',
        backToLogin: 'Back to Login',
        emailSent: 'Reset link has been sent to your email address',
        passwordMismatch: 'Passwords do not match',
        weakPassword: 'Password does not meet security requirements',
        resetSuccess: 'Password has been reset successfully',
        resetError: 'Error resetting password',
        invalidEmail: 'Please enter a valid email address'
      }
    };
    return texts[lang as keyof typeof texts] || texts.de;
  };

  const t = getTexts(language);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: t.invalidEmail,
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setMessage(t.emailSent);
      toast({
        title: "E-Mail gesendet",
        description: t.emailSent,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || t.resetError,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(password);
    
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: t.weakPassword,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: t.passwordMismatch,
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich",
        description: t.resetSuccess,
      });
      
      onBack();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || t.resetError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToLogin}
        </Button>

        <Card className="shadow-large bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle>{step === 'request' ? t.title : t.resetTitle}</CardTitle>
            <CardDescription>
              {step === 'request' ? t.description : t.resetDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {message && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihr.name@beispiel.de"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Wird gesendet...' : t.sendReset}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Wird zurückgesetzt...' : t.resetPassword}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}