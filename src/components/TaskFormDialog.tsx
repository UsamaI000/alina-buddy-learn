import { useState, useEffect, useMemo } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getTranslation, type Language } from '@/utils/i18n';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: Partial<any>;
  title?: string;
  language?: string;
}

interface LearningModule {
  id: string;
  title: string;
}

export function TaskFormDialog({ open, onOpenChange, onSubmit, defaultValues, title, language = 'de' }: TaskFormDialogProps) {
  const texts = getTranslation('taskForm', language as Language);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingModules, setLoadingModules] = useState(true);
  
  const taskSchema = useMemo(() => z.object({
    title: z.string().min(1, texts.titleRequired),
    description: z.string().optional(),
    learning_module_id: z.string().min(1, texts.learningModuleRequired),
    due_date: z.date({ required_error: texts.dueDateRequired }),
    assigned_students: z.array(z.string()).min(1, texts.assignStudentsRequired),
  }), [texts]);
  
  type TaskFormData = z.infer<typeof taskSchema>;

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      learning_module_id: defaultValues?.learning_module_id || '',
      assigned_students: defaultValues?.assigned_students || [],
      due_date: defaultValues?.due_date,
    },
  });

  const dueDate = watch('due_date');
  const learningModuleId = watch('learning_module_id');
  const assignedStudents = watch('assigned_students') || [];

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      console.error('Failed to fetch learning modules:', err);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || texts.createTask}</DialogTitle>
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
            <Label>{texts.learningModule} *</Label>
            {loadingModules ? (
              <p className="text-sm text-muted-foreground">{texts.loadingModules}</p>
            ) : (
              <Select value={learningModuleId} onValueChange={(value) => setValue('learning_module_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={texts.selectModule} />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.learning_module_id && <p className="text-sm text-destructive mt-1">{errors.learning_module_id.message}</p>}
          </div>

          <div>
            <Label>{texts.dueDate} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'dd.MM.yyyy') : texts.selectDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setValue('due_date', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.due_date && <p className="text-sm text-destructive mt-1">{errors.due_date.message}</p>}
          </div>

          <div>
            <Label>{texts.assignStudents} *</Label>
            <StudentMultiSelect
              selectedStudents={assignedStudents}
              onChange={(students) => setValue('assigned_students', students)}
            />
            {errors.assigned_students && <p className="text-sm text-destructive mt-1">{errors.assigned_students.message}</p>}
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
