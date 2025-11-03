import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StudentMultiSelect } from './StudentMultiSelect';
import { cn } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  start_time: z.date({ required_error: 'Startzeit ist erforderlich' }),
  end_time: z.date({ required_error: 'Endzeit ist erforderlich' }),
  event_type: z.enum(['exam', 'training', 'meeting', 'other']),
  assigned_students: z.array(z.string()).optional(),
}).refine(data => data.end_time > data.start_time, {
  message: 'Endzeit muss nach Startzeit liegen',
  path: ['end_time'],
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  defaultValues?: Partial<EventFormData>;
  title?: string;
}

const eventTypeLabels = {
  exam: 'Prüfung',
  training: 'Schulung',
  meeting: 'Meeting',
  other: 'Sonstiges',
};

export function EventFormDialog({ open, onOpenChange, onSubmit, defaultValues, title = 'Event erstellen' }: EventFormDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      event_type: defaultValues?.event_type || 'other',
      assigned_students: defaultValues?.assigned_students || [],
      start_time: defaultValues?.start_time,
      end_time: defaultValues?.end_time,
    },
  });

  const selectedDate = watch('start_time');
  const eventType = watch('event_type');
  const assignedStudents = watch('assigned_students') || [];

  const handleFormSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div>
            <Label>Event-Typ *</Label>
            <Select value={eventType} onValueChange={(value) => setValue('event_type', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Datum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setValue('start_time', date);
                        setValue('end_time', date);
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.start_time && <p className="text-sm text-destructive mt-1">{errors.start_time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Von *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  const currentDate = watch('start_time');
                  if (currentDate) {
                    const newStart = new Date(currentDate);
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    newStart.setHours(hours, minutes, 0, 0);
                    setValue('start_time', newStart);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Bis *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  const currentDate = watch('end_time');
                  if (currentDate) {
                    const newEnd = new Date(currentDate);
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    newEnd.setHours(hours, minutes, 0, 0);
                    setValue('end_time', newEnd);
                  }
                }}
              />
            </div>
          </div>
          {errors.end_time && <p className="text-sm text-destructive mt-1">{errors.end_time.message}</p>}

          <div>
            <Label>Auszubildende zuweisen (optional)</Label>
            <StudentMultiSelect
              selectedStudents={assignedStudents}
              onChange={(students) => setValue('assigned_students', students)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
