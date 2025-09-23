import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import type { AppUser } from '@/types/auth';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface WelcomeTourProps {
  user: AppUser;
  language: string;
  onComplete: () => void;
}

export function WelcomeTour({ user, language, onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const t = {
    de: {
      welcome: 'Willkommen bei ALINA!',
      welcomeBack: 'Willkommen zurück!',
      tourTitle: 'Lassen Sie uns eine kurze Tour machen',
      next: 'Weiter',
      previous: 'Zurück',
      finish: 'Tour beenden',
      skip: 'Überspringen',
      step: 'Schritt',
      of: 'von'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  const getStepsForRole = (role: string): TourStep[] => {
    if (role === 'AUSBILDER_IN') {
      return [
        {
          id: 'welcome',
          title: `${texts.welcome}`,
          description: 'Als Ausbilder/in haben Sie Zugriff auf erweiterte Funktionen zur Verwaltung Ihrer Auszubildenden.',
          position: 'center'
        },
        {
          id: 'dashboard',
          title: 'Ihr Dashboard',
          description: 'Hier finden Sie alle wichtigen Funktionen: Auszubildenden-Verwaltung, Lerninhalte und Statistiken.',
          position: 'center'
        },
        {
          id: 'students',
          title: 'Auszubildenden-Verwaltung',
          description: 'Verwalten Sie Ihre Auszubildenden, verfolgen Sie deren Fortschritt und weisen Sie Aufgaben zu.',
          position: 'center'
        },
        {
          id: 'chat',
          title: 'ALINA Chat',
          description: 'Nutzen Sie den KI-Assistenten ALINA für Unterstützung bei der Ausbildung und Fragen.',
          position: 'center'
        }
      ];
    } else {
      return [
        {
          id: 'welcome',
          title: `${texts.welcome}`,
          description: 'ALINA ist Ihr digitaler Lernbegleiter für die Ausbildung. Lassen Sie uns die wichtigsten Funktionen erkunden.',
          position: 'center'
        },
        {
          id: 'learning',
          title: 'Ihr Lernbereich',
          description: 'Hier finden Sie Ihre personalisierten Lerninhalte und können Ihren Fortschritt verfolgen.',
          position: 'center'
        },
        {
          id: 'chat',
          title: 'Chat mit ALINA',
          description: 'Stellen Sie Fragen, lassen Sie sich Konzepte erklären oder bitten Sie um Hilfe bei Aufgaben.',
          position: 'center'
        },
        {
          id: 'calendar',
          title: 'Kalender & Termine',
          description: 'Behalten Sie den Überblick über Ihre Lernziele, Prüfungstermine und wichtige Deadlines.',
          position: 'center'
        }
      ];
    }
  };

  const [steps, setSteps] = useState<TourStep[]>([]);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem(`alina_tour_completed_${user.id}`) === 'true';
    
    if (!hasSeenTour) {
      setSteps(getStepsForRole(user.role));
      setIsVisible(true);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`alina_tour_completed_${user.id}`, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(`alina_tour_completed_${user.id}`, 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="secondary">
                {texts.step} {currentStep + 1} {texts.of} {steps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {currentStepData.title}
            </h2>
            
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>

            {currentStep === 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Hallo {user.name}!</strong><br />
                  Sie sind angemeldet als: <Badge variant="outline">{user.role === 'AUSBILDER_IN' ? 'Ausbilder/in' : 'Auszubildende/r'}</Badge>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? handleSkip : handlePrevious}
              className="flex items-center gap-2"
            >
              {currentStep === 0 ? (
                texts.skip
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  {texts.previous}
                </>
              )}
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                texts.finish
              ) : (
                <>
                  {texts.next}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}