import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, ArrowLeft, User, Building, GraduationCap, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { validatePassword } from '@/utils/passwordValidation';
import type { UserRole } from '@/types/auth';

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  apprenticeship: string;
  company: string;
}

interface RegistrationWizardProps {
  onComplete: () => void;
  onBack: () => void;
  language: string;
}

export function RegistrationWizard({ onComplete, onBack, language }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'AUSZUBILDENDE_R',
    apprenticeship: '',
    company: ''
  });
  const { toast } = useToast();

  const t = {
    de: {
      registration: 'Registrierung',
      step: 'Schritt',
      of: 'von',
      next: 'Weiter',
      previous: 'Zurück',
      complete: 'Registrierung abschließen',
      accountInfo: 'Kontoinformationen',
      personalInfo: 'Persönliche Daten',
      professionalInfo: 'Berufliche Informationen',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      role: 'Rolle',
      apprenticeship: 'Ausbildungsberuf',
      company: 'Unternehmen',
      student: 'Auszubildende/r',
      instructor: 'Ausbilder/in',
      passwordsNoMatch: 'Passwörter stimmen nicht überein',
      weakPassword: 'Passwort entspricht nicht den Anforderungen',
      allFieldsRequired: 'Bitte füllen Sie alle Felder aus',
      registrationSuccess: 'Registrierung erfolgreich!',
      checkEmail: 'Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!data.email || !data.password || !data.confirmPassword) {
          toast({
            title: texts.allFieldsRequired,
            variant: "destructive"
          });
          return false;
        }
        if (data.password !== data.confirmPassword) {
          toast({
            title: texts.passwordsNoMatch,
            variant: "destructive"
          });
          return false;
        }
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
          toast({
            title: texts.weakPassword,
            description: passwordValidation.feedback.join(', '),
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!data.firstName || !data.lastName) {
          toast({
            title: texts.allFieldsRequired,
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        if (!data.apprenticeship || !data.company) {
          toast({
            title: texts.allFieldsRequired,
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/verify-email`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            apprenticeship: data.apprenticeship,
            company: data.company
          }
        }
      });

      if (error) throw error;

      toast({
        title: texts.registrationSuccess,
        description: texts.checkEmail
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold">{texts.accountInfo}</h3>
        <p className="text-sm text-muted-foreground">
          Erstellen Sie Ihr Konto mit E-Mail und Passwort
        </p>
      </div>

      <div>
        <Label htmlFor="email">{texts.email}</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData({...data, email: e.target.value})}
          placeholder="ihre@email.de"
        />
      </div>

      <div>
        <Label htmlFor="password">{texts.password}</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData({...data, password: e.target.value})}
        />
        {data.password && (
          <PasswordStrengthIndicator password={data.password} />
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={data.confirmPassword}
          onChange={(e) => setData({...data, confirmPassword: e.target.value})}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold">{texts.personalInfo}</h3>
        <p className="text-sm text-muted-foreground">
          Ihre persönlichen Informationen
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">{texts.firstName}</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => setData({...data, firstName: e.target.value})}
            placeholder="Max"
          />
        </div>
        <div>
          <Label htmlFor="lastName">{texts.lastName}</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => setData({...data, lastName: e.target.value})}
            placeholder="Mustermann"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="role">{texts.role}</Label>
        <Select value={data.role} onValueChange={(value: UserRole) => setData({...data, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AUSZUBILDENDE_R">{texts.student}</SelectItem>
            <SelectItem value="AUSBILDER_IN">{texts.instructor}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold">{texts.professionalInfo}</h3>
        <p className="text-sm text-muted-foreground">
          Informationen zu Ihrer Ausbildung
        </p>
      </div>

      <div>
        <Label htmlFor="apprenticeship">{texts.apprenticeship}</Label>
        <Input
          id="apprenticeship"
          value={data.apprenticeship}
          onChange={(e) => setData({...data, apprenticeship: e.target.value})}
          placeholder="z.B. Fachinformatiker/in"
        />
      </div>

      <div>
        <Label htmlFor="company">{texts.company}</Label>
        <Input
          id="company"
          value={data.company}
          onChange={(e) => setData({...data, company: e.target.value})}
          placeholder="z.B. Musterfirma GmbH"
        />
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Nach der Registrierung erhalten Sie eine Bestätigungs-E-Mail.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {texts.registration}
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {texts.step} {currentStep} {texts.of} {totalSteps}
            </p>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onBack : handlePrevious}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Zurück zum Login' : texts.previous}
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={loading}>
                {texts.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Registrierung...' : texts.complete}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}