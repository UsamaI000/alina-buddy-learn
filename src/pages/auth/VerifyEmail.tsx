import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerifyEmailProps {
  userEmail?: string;
  language: string;
}

export default function VerifyEmail({ userEmail, language }: VerifyEmailProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const { toast } = useToast();

  const getTexts = (lang: string) => {
    const texts = {
      de: {
        title: 'E-Mail bestätigen',
        pending: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
        pendingDescription: 'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.',
        verified: 'E-Mail erfolgreich bestätigt!',
        verifiedDescription: 'Ihr Konto wurde aktiviert. Sie können sich jetzt anmelden.',
        error: 'Bestätigung fehlgeschlagen',
        errorDescription: 'Der Bestätigungslink ist ungültig oder abgelaufen.',
        resendEmail: 'E-Mail erneut senden',
        backToLogin: 'Zur Anmeldung',
        emailSent: 'Bestätigungs-E-Mail wurde erneut gesendet',
        resendError: 'Fehler beim Senden der E-Mail'
      },
      en: {
        title: 'Verify Email',
        pending: 'Please confirm your email address',
        pendingDescription: 'We have sent you a confirmation email. Click the link in the email to activate your account.',
        verified: 'Email successfully verified!',
        verifiedDescription: 'Your account has been activated. You can now log in.',
        error: 'Verification failed',
        errorDescription: 'The verification link is invalid or expired.',
        resendEmail: 'Resend Email',
        backToLogin: 'Back to Login',
        emailSent: 'Confirmation email has been resent',
        resendError: 'Error sending email'
      }
    };
    return texts[lang as keyof typeof texts] || texts.de;
  };

  const t = getTexts(language);

  useEffect(() => {
    // Check if user came from email verification link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'signup' && accessToken) {
      setStatus('verified');
    }
  }, []);

  const handleResendEmail = async () => {
    if (!userEmail) return;

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        }
      });

      if (error) throw error;

      toast({
        title: "E-Mail gesendet",
        description: t.emailSent,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || t.resendError,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verified':
        return (
          <>
            <div className="mx-auto mb-4 w-12 h-12 bg-success rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-foreground" />
            </div>
            <CardTitle className="text-success">{t.verified}</CardTitle>
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{t.verifiedDescription}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full mt-4"
            >
              {t.backToLogin}
            </Button>
          </>
        );
      
      case 'error':
        return (
          <>
            <div className="mx-auto mb-4 w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive-foreground" />
            </div>
            <CardTitle className="text-destructive">{t.error}</CardTitle>
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t.errorDescription}</AlertDescription>
            </Alert>
            <div className="space-y-2 mt-4">
              {userEmail && (
                <Button 
                  onClick={handleResendEmail}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Wird gesendet...' : t.resendEmail}
                </Button>
              )}
              <Button 
                onClick={() => navigate("/login")}
                className="w-full"
              >
                {t.backToLogin}
              </Button>
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle>{t.title}</CardTitle>
            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t.pendingDescription}
                {userEmail && (
                  <div className="mt-2 font-medium text-foreground">
                    {userEmail}
                  </div>
                )}
              </AlertDescription>
            </Alert>
            <div className="space-y-2 mt-4">
              {userEmail && (
                <Button 
                  onClick={handleResendEmail}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Wird gesendet...' : t.resendEmail}
                </Button>
              )}
              <Button 
                onClick={() => navigate("/login")}
                variant="ghost"
                className="w-full"
              >
                {t.backToLogin}
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="mb-6 text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToLogin}
        </Button>

        <Card className="shadow-large bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            {getStatusContent()}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}