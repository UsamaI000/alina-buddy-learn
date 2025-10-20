import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, User, Mail, Building, CheckCircle } from 'lucide-react';
import type { AppUser } from '@/types/auth';

interface ProfileCompletionBannerProps {
  user: AppUser;
  onNavigateToProfile: () => void;
  language: string;
}

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  icon: React.ReactNode;
}

export function ProfileCompletionBanner({ user, onNavigateToProfile, language }: ProfileCompletionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([]);

  const t = {
    de: {
      completeProfile: 'Profil vervollständigen',
      profileIncomplete: 'Ihr Profil ist noch nicht vollständig',
      completeNow: 'Jetzt vervollständigen',
      dismiss: 'Schließen',
      emailVerified: 'E-Mail bestätigt',
      personalInfo: 'Persönliche Daten',
      companyInfo: 'Unternehmensinfos',
      completed: 'abgeschlossen'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  useEffect(() => {
    const loc = t[language as keyof typeof t] || t.de;
    // Check what profile information is missing
    const items: CompletionItem[] = [
      {
        id: 'email_verified',
        label: loc.emailVerified,
        completed: true, // Assume verified for now
        icon: <Mail className="h-4 w-4" />
      },
      {
        id: 'personal_info',
        label: loc.personalInfo,
        completed: !!(user.name && user.name.trim()),
        icon: <User className="h-4 w-4" />
      },
      {
        id: 'company_info',
        label: loc.companyInfo,
        completed: !!(user.apprenticeship && user.apprenticeship.trim()),
        icon: <Building className="h-4 w-4" />
      }
    ];

    setCompletionItems(items);
  }, [user, language]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const totalCount = completionItems.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  // Don't show banner if profile is complete or if user dismissed it
  if (completionPercentage === 100 || !isVisible) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
              {texts.completeProfile}
            </h4>
          </div>
          
          <AlertDescription className="text-amber-700 dark:text-amber-300 mb-3">
            {texts.profileIncomplete} ({completedCount}/{totalCount} {texts.completed})
          </AlertDescription>

          <div className="space-y-2 mb-4">
            <Progress 
              value={completionPercentage} 
              className="h-2 bg-amber-200 dark:bg-amber-900"
            />
            
            <div className="flex flex-wrap gap-2">
              {completionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    item.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    item.icon
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onNavigateToProfile}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {texts.completeNow}
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{texts.dismiss}</span>
        </Button>
      </div>
    </Alert>
  );
}