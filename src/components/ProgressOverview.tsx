import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type LearningModule = Database['public']['Tables']['learning_modules']['Row'];

interface ProgressOverviewProps {
  tasks: Task[];
  modules: LearningModule[];
}

export function ProgressOverview({ tasks, modules }: ProgressOverviewProps) {
  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const totalTasks = tasks.length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      title: 'Abgeschlossene Aufgaben',
      value: completedTasks,
      total: totalTasks,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'In Bearbeitung',
      value: inProgressTasks,
      total: totalTasks,
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      title: 'Lernmodule verfügbar',
      value: modules.length,
      icon: Target,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Progress Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Lernfortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Gesamtfortschritt</span>
              <span className="font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedTasks} von {totalTasks} Aufgaben abgeschlossen</span>
              <span>{totalTasks - completedTasks} verbleibend</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-secondary`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.total && <span className="text-muted-foreground">/{stat.total}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}