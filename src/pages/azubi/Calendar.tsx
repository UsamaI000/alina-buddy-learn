import { useState } from 'react';
import { format, parseISO, isAfter, isSameDay, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import type { AppUser } from '@/types/auth';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface CalendarProps {
  user: AppUser;
  language: string;
}

const Calendar_Page = ({ user, language }: CalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { events, loading: eventsLoading } = useEvents();
  const { tasks, loading: tasksLoading } = useTasks();

  const loading = eventsLoading || tasksLoading;

  // Get dates with events
  const eventDates = events.map(e => startOfDay(parseISO(e.start_time)));
  
  // Get dates with tasks
  const taskDates = tasks
    .filter(t => t.due_date)
    .map(t => startOfDay(parseISO(t.due_date!)));
  
  // Get dates with overdue tasks
  const overdueDates = tasks
    .filter(t => 
      t.due_date && 
      isAfter(startOfDay(new Date()), startOfDay(parseISO(t.due_date))) && 
      t.status !== 'DONE'
    )
    .map(t => startOfDay(parseISO(t.due_date!)));

  // Filter events and tasks for selected date
  const dayEvents = selectedDate 
    ? events.filter(e => isSameDay(parseISO(e.start_time), selectedDate))
    : [];
  
  const dayTasks = selectedDate
    ? tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate))
    : [];

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'OPEN':
        return <Circle className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Erledigt</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Bearbeitung</Badge>;
      case 'OPEN':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Offen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date) return false;
    return isAfter(startOfDay(new Date()), startOfDay(parseISO(task.due_date))) && task.status !== 'DONE';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <CalendarIcon className="inline-block mr-3 h-8 w-8" />
            Kalender
          </h1>
          <p className="text-muted-foreground">
            Deine Termine und Aufgaben im Überblick
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[350px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            {/* Calendar Section */}
            <Card>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasEvent: eventDates,
                    hasTask: taskDates,
                    hasOverdueTask: overdueDates
                  }}
                  modifiersClassNames={{
                    hasEvent: 'bg-blue-100 dark:bg-blue-900 font-semibold',
                    hasTask: 'bg-green-100 dark:bg-green-900',
                    hasOverdueTask: 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                  }}
                />
                
                {/* Legend */}
                <div className="mt-6 space-y-2 border-t pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Legende:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded bg-blue-100 dark:bg-blue-900 border" />
                    <span className="text-muted-foreground">Termine</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900 border" />
                    <span className="text-muted-foreground">Aufgaben</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded bg-red-100 dark:bg-red-900 border" />
                    <span className="text-muted-foreground">Überfällige Aufgaben</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })
                    : 'Wähle einen Tag aus'}
                </CardTitle>
                <CardDescription>
                  {dayEvents.length === 0 && dayTasks.length === 0 
                    ? 'Keine Termine oder Aufgaben für diesen Tag'
                    : `${dayEvents.length} Termin${dayEvents.length !== 1 ? 'e' : ''}, ${dayTasks.length} Aufgabe${dayTasks.length !== 1 ? 'n' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedDate ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Wähle einen Tag im Kalender aus, um Details zu sehen</p>
                  </div>
                ) : (
                  <>
                    {/* Events Section */}
                    {dayEvents.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          Termine
                        </h3>
                        <div className="space-y-3">
                          {dayEvents.map(event => (
                            <Card key={event.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-foreground mb-1">
                                      {event.title}
                                    </h4>
                                    {event.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {event.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(parseISO(event.start_time), 'HH:mm', { locale: de })}
                                        {event.end_time && 
                                          ` - ${format(parseISO(event.end_time), 'HH:mm', { locale: de })}`
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks Section */}
                    {dayTasks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Aufgaben
                        </h3>
                        <div className="space-y-3">
                          {dayTasks.map(task => (
                            <Card 
                              key={task.id} 
                              className={`border-l-4 ${
                                isOverdue(task) 
                                  ? 'border-l-red-500' 
                                  : task.status === 'DONE' 
                                    ? 'border-l-green-500' 
                                    : 'border-l-yellow-500'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    {getTaskStatusIcon(task.status)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-semibold ${
                                          task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'
                                        }`}>
                                          {task.title}
                                        </h4>
                                        {isOverdue(task) && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Überfällig
                                          </Badge>
                                        )}
                                      </div>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2">
                                        {getTaskStatusBadge(task.status)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {dayEvents.length === 0 && dayTasks.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium mb-1">Keine Einträge für diesen Tag</p>
                        <p className="text-sm">An diesem Tag sind keine Termine oder Aufgaben geplant</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Termine gesamt</p>
                  <p className="text-2xl font-bold text-foreground">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Erledigte Aufgaben</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tasks.filter(t => t.status === 'DONE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offene Aufgaben</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tasks.filter(t => t.status !== 'DONE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar_Page;
