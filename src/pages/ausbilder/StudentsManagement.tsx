import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, ArrowLeft, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { AppUser } from '@/types/auth';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  apprenticeship: string;
  company: string;
  created_at: string;
  task_stats?: {
    total: number;
    completed: number;
    open: number;
  };
}

interface StudentsManagementProps {
  user: AppUser;
  language: string;
  onBack: () => void;
}

export default function StudentsManagement({ user, language, onBack }: StudentsManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    de: {
      title: 'Auszubildende verwalten',
      subtitle: 'Übersicht aller Auszubildenden',
      search: 'Suchen...',
      back: 'Zurück',
      noStudents: 'Keine Auszubildenden gefunden',
      tasks: 'Aufgaben',
      completed: 'Abgeschlossen',
      open: 'Offen',
      total: 'Gesamt',
      apprenticeship: 'Ausbildung',
      company: 'Unternehmen',
      since: 'Seit'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch all students (users with role AUSZUBILDENDE_R from user_roles table)
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'AUSZUBILDENDE_R');

      if (studentsError) throw studentsError;

      // Fetch task statistics for each student
      const studentsWithStats = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('status')
            .eq('user_id', student.user_id);

          const taskStats = {
            total: tasks?.length || 0,
            completed: tasks?.filter(t => t.status === 'DONE').length || 0,
            open: tasks?.filter(t => t.status === 'OPEN').length || 0,
          };

          return {
            ...student,
            task_stats: taskStats
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.apprenticeship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Auszubildende...</p>
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={texts.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{texts.noStudents}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {student.first_name} {student.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{texts.apprenticeship}</p>
                    <Badge variant="secondary">{student.apprenticeship}</Badge>
                  </div>

                  {student.company && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{texts.company}</p>
                      <p className="text-sm">{student.company}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{texts.since}</p>
                    <p className="text-sm">{new Date(student.created_at).toLocaleDateString('de-DE')}</p>
                  </div>

                  {student.task_stats && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{texts.tasks}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold text-foreground">{student.task_stats.total}</div>
                          <div className="text-xs text-muted-foreground">{texts.total}</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{student.task_stats.completed}</div>
                          <div className="text-xs text-muted-foreground">{texts.completed}</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-orange-600">{student.task_stats.open}</div>
                          <div className="text-xs text-muted-foreground">{texts.open}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}