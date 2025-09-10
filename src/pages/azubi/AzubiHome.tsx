import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Calendar, Trophy } from 'lucide-react';
import type { AppUser } from '@/types/auth';

interface AzubiHomeProps {
  user: AppUser;
  language: string;
}

export default function AzubiHome({ user, language }: AzubiHomeProps) {
  const t = {
    de: {
      title: 'Willkommen zurück',
      subtitle: 'Dein Lernbereich',
      learningPath: 'Lernpfad',
      chat: 'Chat mit ALINA',
      calendar: 'Kalender',
      achievements: 'Erfolge',
      continue: 'Weiter lernen',
      startChat: 'Chat starten',
      viewCalendar: 'Kalender öffnen',
      viewAchievements: 'Erfolge ansehen'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Learning Path Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {texts.learningPath}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Setze dein Lernen fort und erreiche deine Ziele.
              </p>
              <Button className="w-full">
                {texts.continue}
              </Button>
            </CardContent>
          </Card>

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
              <Button variant="outline" className="w-full">
                {texts.startChat}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {texts.calendar}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Verwalte deine Termine und Lernziele.
              </p>
              <Button variant="outline" className="w-full">
                {texts.viewCalendar}
              </Button>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {texts.achievements}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deine bisherigen Erfolge und Fortschritte.
              </p>
              <Button variant="outline">
                {texts.viewAchievements}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}