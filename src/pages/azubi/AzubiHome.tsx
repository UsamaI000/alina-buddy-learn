import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Calendar, Trophy, Plus } from 'lucide-react';
import { LearningModuleCard } from '@/components/LearningModuleCard';
import { TaskCard } from '@/components/TaskCard';
import { ProgressOverview } from '@/components/ProgressOverview';
import { EventsCalendar } from '@/components/EventsCalendar';
import { useLearningModules } from '@/hooks/useLearningModules';
import { useTasks } from '@/hooks/useTasks';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from '@/types/auth';

interface AzubiHomeProps {
  user: AppUser;
  language: string;
}

export default function AzubiHome({ user, language }: AzubiHomeProps) {
  const { toast } = useToast();
  const { modules, loading: modulesLoading } = useLearningModules(user.apprenticeship);
  const { tasks, loading: tasksLoading, updateTaskStatus } = useTasks();
  const { events, loading: eventsLoading } = useEvents();

  // Sort modules by created_at (newest first) for dashboard display
  const recentModules = [...modules]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const t = {
    de: {
      title: 'Willkommen zurück',
      subtitle: 'Dein Lernbereich',
      learningPath: 'Lernmodule',
      tasks: 'Meine Aufgaben',
      chat: 'Chat mit ALINA',
      calendar: 'Termine',
      achievements: 'Erfolge',
      progress: 'Lernfortschritt',
      continue: 'Weiter lernen',
      startChat: 'Chat starten',
      viewCalendar: 'Kalender öffnen',
      viewAchievements: 'Erfolge ansehen',
      viewAll: 'Alle anzeigen',
      noTasks: 'Keine Aufgaben vorhanden',
      noModules: 'Keine Lernmodule verfügbar'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  const handleStartModule = (moduleId: string) => {
    toast({
      title: "Lernmodul gestartet",
      description: "Das Lernmodul wurde geöffnet.",
    });
    // TODO: Navigate to module content
  };

  const handleTaskStatusUpdate = async (taskId: string, status: any) => {
    await updateTaskStatus(taskId, status);
    toast({
      title: "Aufgabe aktualisiert",
      description: "Der Status wurde erfolgreich geändert.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {texts.title}, {user.name}!
          </h1>
          <p className="text-muted-foreground mb-4">{texts.subtitle}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">Auszubildende/r</Badge>
            <Badge variant="outline">{user.apprenticeship}</Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Progress Overview */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">{texts.progress}</h2>
            <ProgressOverview tasks={tasks} modules={modules} />
          </section>

          {/* Learning Modules */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{texts.learningPath}</h2>
              {modules.length > 3 && (
                <Button variant="outline" size="sm">
                  {texts.viewAll}
                </Button>
              )}
            </div>
            {modulesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{texts.noModules}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentModules.map((module) => (
                  <LearningModuleCard
                    key={module.id}
                    module={module}
                    onStart={handleStartModule}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tasks */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{texts.tasks}</h2>
                {tasks.length > 3 && (
                  <Button variant="outline" size="sm">
                    {texts.viewAll}
                  </Button>
                )}
              </div>
              {tasksLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-2/3"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{texts.noTasks}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={handleTaskStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Events Calendar and Chat */}
            <div className="space-y-6">
              <EventsCalendar events={events} />
              
              {/* Chat Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    {texts.chat}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stelle Fragen und lerne interaktiv mit ALINA.
                  </p>
                  <Button className="w-full">
                    {texts.startChat}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}