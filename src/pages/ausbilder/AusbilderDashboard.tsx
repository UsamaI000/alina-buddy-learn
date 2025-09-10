import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, BarChart3, Settings, FileText, Calendar } from 'lucide-react';
import type { AppUser } from '@/types/auth';

interface AusbilderDashboardProps {
  user: AppUser;
  language: string;
}

export default function AusbilderDashboard({ user, language }: AusbilderDashboardProps) {
  const t = {
    de: {
      title: 'Ausbilder Dashboard',
      subtitle: 'Verwaltung und Übersicht',
      students: 'Auszubildende',
      content: 'Lerninhalte',
      analytics: 'Statistiken',
      settings: 'Einstellungen',
      exams: 'Prüfungen',
      calendar: 'Kalender',
      manageStudents: 'Auszubildende verwalten',
      manageContent: 'Inhalte verwalten',
      viewAnalytics: 'Statistiken ansehen',
      openSettings: 'Einstellungen öffnen',
      createExam: 'Prüfung erstellen',
      viewCalendar: 'Kalender öffnen'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {texts.title}
          </h1>
          <p className="text-muted-foreground mb-4">
            Willkommen zurück, {user.name}!
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">Ausbilder/in</Badge>
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
                Verwalte deine Auszubildenden und deren Fortschritt.
              </p>
              <Button className="w-full">
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
                Erstelle und bearbeite Lerninhalte und Materialien.
              </p>
              <Button variant="outline" className="w-full">
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
                Analysiere Lernfortschritte und Leistungen.
              </p>
              <Button variant="outline" className="w-full">
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
                Erstelle und verwalte Prüfungen und Tests.
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
                Plane Termine und Lehreinheiten.
              </p>
              <Button variant="outline" className="w-full">
                {texts.viewCalendar}
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
                Konfiguriere deine Einstellungen und Präferenzen.
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