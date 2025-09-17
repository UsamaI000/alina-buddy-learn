import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, BookOpen, CheckCircle, Clock, ArrowLeft, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { AppUser } from '@/types/auth';

interface AnalyticsData {
  totalStudents: number;
  totalModules: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  inProgressTasks: number;
  studentProgress: Array<{
    student: string;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
  }>;
  moduleStats: Array<{
    module: string;
    taskCount: number;
    avgCompletion: number;
  }>;
}

interface AnalyticsDashboardProps {
  user: AppUser;
  language: string;
  onBack: () => void;
}

export default function AnalyticsDashboard({ user, language, onBack }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    de: {
      title: 'Statistiken & Analytics',
      subtitle: 'Übersicht über Fortschritte und Leistungen',
      back: 'Zurück',
      overview: 'Übersicht',
      students: 'Auszubildende',
      modules: 'Lernmodule',
      tasks: 'Aufgaben gesamt',
      completed: 'Abgeschlossen',
      open: 'Offen',
      inProgress: 'In Bearbeitung',
      studentProgress: 'Fortschritt der Auszubildenden',
      moduleStats: 'Modul-Statistiken',
      completionRate: 'Abschlussquote',
      avgCompletion: 'Durchschnittliche Abschlussquote',
      tasksPerModule: 'Aufgaben pro Modul',
      loading: 'Lade Statistiken...'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .eq('role', 'AUSZUBILDENDE_R');

      if (studentsError) throw studentsError;

      // Fetch learning modules
      const { data: modules, error: modulesError } = await supabase
        .from('learning_modules')
        .select('id, title');

      if (modulesError) throw modulesError;

      // Fetch all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, user_id, learning_module_id, status');

      if (tasksError) throw tasksError;

      // Calculate statistics
      const totalStudents = students?.length || 0;
      const totalModules = modules?.length || 0;
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;
      const openTasks = tasks?.filter(t => t.status === 'OPEN').length || 0;
      const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;

      // Calculate student progress
      const studentProgress = students?.map(student => {
        const studentTasks = tasks?.filter(t => t.user_id === student.user_id) || [];
        const completedStudentTasks = studentTasks.filter(t => t.status === 'DONE');
        
        return {
          student: `${student.first_name} ${student.last_name}`,
          completionRate: studentTasks.length > 0 ? Math.round((completedStudentTasks.length / studentTasks.length) * 100) : 0,
          totalTasks: studentTasks.length,
          completedTasks: completedStudentTasks.length
        };
      }) || [];

      // Calculate module statistics
      const moduleStats = modules?.map(module => {
        const moduleTasks = tasks?.filter(t => t.learning_module_id === module.id) || [];
        const moduleCompletedTasks = moduleTasks.filter(t => t.status === 'DONE');
        
        return {
          module: module.title,
          taskCount: moduleTasks.length,
          avgCompletion: moduleTasks.length > 0 ? Math.round((moduleCompletedTasks.length / moduleTasks.length) * 100) : 0
        };
      }) || [];

      setAnalytics({
        totalStudents,
        totalModules,
        totalTasks,
        completedTasks,
        openTasks,
        inProgressTasks,
        studentProgress,
        moduleStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{texts.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {texts.back}
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {texts.title}
          </h1>
          <p className="text-muted-foreground mb-6">
            {texts.subtitle}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.students}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.modules}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalModules}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.tasks}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.completionRate}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.completed}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.completedTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.inProgress}</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.inProgressTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{texts.open}</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.openTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Student Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{texts.studentProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.studentProgress.map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{student.student}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.completedTasks} von {student.totalTasks} Aufgaben
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${student.completionRate}%` }}
                        />
                      </div>
                      <Badge variant={student.completionRate >= 75 ? "default" : student.completionRate >= 50 ? "secondary" : "destructive"}>
                        {student.completionRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Module Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>{texts.moduleStats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.moduleStats.map((module, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{module.module}</p>
                      <Badge variant="outline">{module.taskCount} Aufgaben</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${module.avgCompletion}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[3rem]">{module.avgCompletion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}