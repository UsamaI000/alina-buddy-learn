import { useState, useMemo } from 'react';
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
import { getTranslation, type Language } from '@/utils/i18n';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: Partial<any>;
  title?: string;
  language?: string;
}

export function EventFormDialog({ open, onOpenChange, onSubmit, defaultValues, title, language = 'de' }: EventFormDialogProps) {
  const texts = getTranslation('eventForm', language as Language);
  
  const eventSchema = useMemo(() => z.object({
    title: z.string().min(1, texts.titleRequired),
    description: z.string().optional(),
    start_time: z.date({ required_error: texts.dateRequired }),
    end_time: z.date({ required_error: texts.endTimeRequired }),
    event_type: z.enum(['exam', 'training', 'meeting', 'other']),
    assigned_students: z.array(z.string()).optional(),
  }).refine(data => data.end_time > data.start_time, {
    message: texts.endTimeError,
    path: ['end_time'],
  }), [texts]);
  
  type EventFormData = z.infer<typeof eventSchema>;
  
  const eventTypeLabels = {
    exam: texts.exam,
    training: texts.training,
    meeting: texts.meeting,
    other: texts.other,
  };
  const initialStartTime = defaultValues?.start_time ? format(defaultValues.start_time, 'HH:mm') : '09:00';
  const initialEndTime = defaultValues?.end_time ? format(defaultValues.end_time, 'HH:mm') : '10:00';
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
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
          <DialogTitle>{title || texts.createEvent}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">{texts.title} *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{texts.description}</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div>
            <Label>{texts.eventType} *</Label>
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
              <Label>{texts.date} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : texts.selectDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          const start = new Date(date);
                          const [sh, sm] = startTime.split(':').map(Number);
                          start.setHours(sh, sm, 0, 0);

                          const end = new Date(date);
                          const [eh, em] = endTime.split(':').map(Number);
                          end.setHours(eh, em, 0, 0);

                          setValue('start_time', start);
                          setValue('end_time', end);
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
              <Label htmlFor="startTime">{texts.from} *</Label>
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
              <Label htmlFor="endTime">{texts.to} *</Label>
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
            <Label>{texts.assignStudents}</Label>
            <StudentMultiSelect
              selectedStudents={assignedStudents}
              onChange={(students) => setValue('assigned_students', students)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {texts.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? texts.saving : texts.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
