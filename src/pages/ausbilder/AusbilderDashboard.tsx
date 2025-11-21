import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, BarChart3, Settings, FileText, Calendar, CheckSquare } from 'lucide-react';
import type { AppUser } from '@/types/auth';
import StudentsManagement from './StudentsManagement';
import LearningModulesManagement from './LearningModulesManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import AusbilderCalendar from './AusbilderCalendar';
import TaskAssignment from './TaskAssignment';
import { getTranslation, type Language } from '@/utils/i18n';

interface AusbilderDashboardProps {
  user: AppUser;
  language: string;
}

export default function AusbilderDashboard({ user, language }: AusbilderDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'students' | 'modules' | 'analytics' | 'calendar' | 'tasks'>('dashboard');
  const texts = getTranslation('ausbilderDashboard', language as Language);

  // Render different views based on currentView state
  if (currentView === 'students') {
    return <StudentsManagement user={user} language={language} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'modules') {
    return <LearningModulesManagement user={user} language={language} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'analytics') {
    return <AnalyticsDashboard user={user} language={language} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'calendar') {
    return <AusbilderCalendar user={user} language={language} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'tasks') {
    return <TaskAssignment user={user} language={language} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {texts.title}
          </h1>
          <p className="text-muted-foreground mb-4">
            {texts.welcomeBack}, {user.name}!
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">{texts.roleInstructor}</Badge>
            <Badge variant="outline">{user.apprenticeship}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Students Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {texts.students}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.manageStudentsDesc}
              </p>
              <Button className="w-full" onClick={() => setCurrentView('students')}>
                {texts.manageStudents}
              </Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {texts.content}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.manageContentDesc}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setCurrentView('modules')}>
                {texts.manageContent}
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {texts.analytics}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.viewAnalyticsDesc}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setCurrentView('analytics')}>
                {texts.viewAnalytics}
              </Button>
            </CardContent>
          </Card>

          {/* Exams */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {texts.exams}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.createExamDesc}
              </p>
              <Button variant="outline" className="w-full">
                {texts.createExam}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {texts.calendar}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.viewCalendarDesc}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setCurrentView('calendar')}>
                {texts.viewCalendar}
              </Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                {texts.tasks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.manageTasksDesc}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setCurrentView('tasks')}>
                {texts.manageTasks}
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {texts.settings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {texts.openSettingsDesc}
              </p>
              <Button variant="outline" className="w-full">
                {texts.openSettings}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}