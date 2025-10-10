import { BookOpen } from 'lucide-react';
import { useLearningModules } from '@/hooks/useLearningModules';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      tableHeaders: {
        title: 'Titel',
        apprenticeship: 'Ausbildung',
        description: 'Beschreibung',
        createdAt: 'Erstellt am',
        actions: 'Aktionen'
      },
      startButton: 'Lernen starten'
    },
    en: {
      title: 'All Learning Modules',
      subtitle: 'Overview of all available learning modules for',
      noModules: 'No learning modules available',
      noModulesDesc: 'No learning modules have been created for your apprenticeship yet.',
      tableHeaders: {
        title: 'Title',
        apprenticeship: 'Apprenticeship',
        description: 'Description',
        createdAt: 'Created at',
        actions: 'Actions'
      },
      startButton: 'Start learning'
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
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableHeaders.title}</TableHead>
                    <TableHead>{t.tableHeaders.apprenticeship}</TableHead>
                    <TableHead className="hidden md:table-cell">{t.tableHeaders.description}</TableHead>
                    <TableHead>{t.tableHeaders.createdAt}</TableHead>
                    <TableHead>{t.tableHeaders.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-28" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : modules.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableHeaders.title}</TableHead>
                    <TableHead>{t.tableHeaders.apprenticeship}</TableHead>
                    <TableHead className="hidden md:table-cell">{t.tableHeaders.description}</TableHead>
                    <TableHead>{t.tableHeaders.createdAt}</TableHead>
                    <TableHead>{t.tableHeaders.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium">{module.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{module.apprenticeship}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-md">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {module.description || 'Keine Beschreibung verfügbar'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(module.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartModule(module.id)}
                        >
                          {t.startButton}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
