import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventsCalendarProps {
  events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const upcomingEvents = events
    .filter(event => new Date(event.start_time) >= new Date())
    .slice(0, 5);

  const getEventTimeLabel = (startTime: string) => {
    const date = parseISO(startTime);
    
    if (isToday(date)) {
      return 'Heute';
    } else if (isTomorrow(date)) {
      return 'Morgen';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE', { locale: de });
    } else {
      return format(date, 'dd.MM.yyyy', { locale: de });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Anstehende Termine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine anstehenden Termine
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      {getEventTimeLabel(event.start_time)}
                    </span>
                    <span>
                      {format(parseISO(event.start_time), 'HH:mm', { locale: de })} - 
                      {format(parseISO(event.end_time), 'HH:mm', { locale: de })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}