import { BookOpen } from 'lucide-react';
import { LearningModuleCard } from '@/components/LearningModuleCard';
import { useLearningModules } from '@/hooks/useLearningModules';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppUser } from '@/types/auth';

interface LearningModulesProps {
  user: AppUser;
  language: string;
}

export default function LearningModules({ user, language }: LearningModulesProps) {
  const { modules, loading } = useLearningModules(user.apprenticeship);

  const handleStartModule = (moduleId: string) => {
    console.log('Starting module:', moduleId);
    // TODO: Navigate to module details page
  };

  const text = {
    de: {
      title: 'Alle Lernmodule',
      subtitle: 'Übersicht aller verfügbaren Lernmodule für',
      noModules: 'Keine Lernmodule verfügbar',
      noModulesDesc: 'Es wurden noch keine Lernmodule für deine Ausbildung erstellt.',
    },
    en: {
      title: 'All Learning Modules',
      subtitle: 'Overview of all available learning modules for',
      noModules: 'No learning modules available',
      noModulesDesc: 'No learning modules have been created for your apprenticeship yet.',
    }
  };

  const t = text[language as keyof typeof text] || text.de;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          </div>
          <p className="text-muted-foreground">
            {t.subtitle} {user.apprenticeship}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <LearningModuleCard
                key={module.id}
                module={module}
                onStart={handleStartModule}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.noModules}</h3>
              <p className="text-muted-foreground max-w-md">{t.noModulesDesc}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
