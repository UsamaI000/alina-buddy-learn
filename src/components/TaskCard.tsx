import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';
import { getTranslation, type Language } from '@/utils/i18n';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  language?: string;
}

export function TaskCard({ task, onUpdateStatus, language = 'de' }: TaskCardProps) {
  const texts = getTranslation('taskCard', language as Language);
  const getStatusIcon = () => {
    switch (task.status) {
      case 'DONE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (task.status) {
      case 'DONE':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isOverdue = task.due_date && isAfter(new Date(), parseISO(task.due_date));

  const handleStatusChange = () => {
    const nextStatus: TaskStatus = task.status === 'OPEN' ? 'IN_PROGRESS' : 
                                  task.status === 'IN_PROGRESS' ? 'DONE' : 'OPEN';
    onUpdateStatus(task.id, nextStatus);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isOverdue && task.status !== 'DONE' ? 'border-red-300' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            {task.title}
          </CardTitle>
          <Badge variant={getStatusVariant()}>
            {task.status === 'DONE' ? texts.completed : 
             task.status === 'IN_PROGRESS' ? texts.inProgress : texts.open}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.due_date && (
              <span className={`text-sm ${isOverdue && task.status !== 'DONE' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {texts.due}: {format(parseISO(task.due_date), 'dd.MM.yyyy', { locale: de })}
              </span>
            )}
            {isOverdue && task.status !== 'DONE' && (
              <Badge variant="destructive" className="text-xs">{texts.overdue}</Badge>
            )}
          </div>
          {task.status !== 'DONE' && (
            <Button size="sm" onClick={handleStatusChange}>
              {task.status === 'OPEN' ? texts.start : texts.complete}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}