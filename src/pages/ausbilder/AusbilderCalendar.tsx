import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, ArrowLeft, Calendar as CalendarIcon, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { EventFormDialog } from '@/components/EventFormDialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AppUser } from '@/types/auth';
import { getTranslation, type Language } from '@/utils/i18n';

interface AusbilderCalendarProps {
  user: AppUser;
  language: string;
  onBack: () => void;
}

export default function AusbilderCalendar({ user, language, onBack }: AusbilderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const texts = getTranslation('ausbilderCalendar', language as Language);

  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents();

  const eventTypeLabels = {
    exam: { label: texts.exam, color: 'bg-red-500' },
    training: { label: texts.training, color: 'bg-blue-500' },
    meeting: { label: texts.meeting, color: 'bg-green-500' },
    other: { label: texts.other, color: 'bg-gray-500' },
  };

  const weekDays = [texts.monday, texts.tuesday, texts.wednesday, texts.thursday, texts.friday, texts.saturday, texts.sunday];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnSelectedDate = events.filter(event =>
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_time), day));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleCreateEvent = async (data: any) => {
    try {
      if (data.assigned_students && data.assigned_students.length > 0) {
        // Create event for each assigned student
        await Promise.all(
          data.assigned_students.map((userId: string) =>
            createEvent({
              title: data.title,
              description: data.description,
              start_time: data.start_time.toISOString(),
              end_time: data.end_time.toISOString(),
              event_type: data.event_type,
              user_id: userId,
            })
          )
        );
      } else {
        // Create event for instructor
        await createEvent({
          ...data,
          start_time: data.start_time.toISOString(),
          end_time: data.end_time.toISOString(),
          user_id: user.id,
        });
      }
      toast.success(texts.eventCreated);
    } catch (error) {
      toast.error(texts.createError);
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent(editingEvent.id, {
        title: data.title,
        description: data.description,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        event_type: data.event_type,
      });
      toast.success(texts.eventUpdated);
      setEditingEvent(null);
    } catch (error) {
      toast.error(texts.updateError);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    
    try {
      await deleteEvent(deleteEventId);
      toast.success(texts.eventDeleted);
      setDeleteEventId(null);
    } catch (error) {
      toast.error(texts.deleteError);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {texts.back}
            </Button>
            <h1 className="text-3xl font-bold">{texts.title}</h1>
          </div>
          <Button onClick={() => { setEditingEvent(null); setShowEventDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {texts.newEvent}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">
                  {format(currentDate, 'MMMM yyyy', { locale: de })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">{texts.loading}</div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  {monthDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    
                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          p-2 rounded-lg text-sm transition-colors min-h-[60px] flex flex-col items-center justify-start
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                          ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                          ${isToday(day) && !isSelected ? 'border-2 border-primary' : ''}
                        `}
                      >
                        <span className="font-medium mb-1">{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]?.color || 'bg-gray-500'}`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsOnSelectedDate.length === 0 ? (
                <p className="text-muted-foreground text-sm">{texts.noEvents}</p>
              ) : (
                <div className="space-y-3">
                  {eventsOnSelectedDate.map(event => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary">
                            {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]?.label || 'Event'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingEvent({
                                  ...event,
                                  start_time: new Date(event.start_time),
                                  end_time: new Date(event.end_time),
                                });
                                setShowEventDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteEventId(event.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <h4 className="font-medium mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventFormDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        defaultValues={editingEvent}
        title={editingEvent ? texts.editEvent : texts.createEvent}
        language={language}
      />

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{texts.deleteEvent}</AlertDialogTitle>
            <AlertDialogDescription>
              {texts.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>{texts.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
