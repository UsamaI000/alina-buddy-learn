import { useState, useMemo } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft, Plus, Search, Edit, Trash, CheckCircle, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { TaskFormDialog } from '@/components/TaskFormDialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AppUser } from '@/types/auth';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskAssignmentProps {
  user: AppUser;
  language: string;
  onBack: () => void;
}

const statusConfig = {
  OPEN: { label: 'Offen', icon: Circle, color: 'text-yellow-600', variant: 'default' as const },
  IN_PROGRESS: { label: 'In Bearbeitung', icon: Clock, color: 'text-blue-600', variant: 'secondary' as const },
  DONE: { label: 'Erledigt', icon: CheckCircle, color: 'text-green-600', variant: 'outline' as const },
};

export default function TaskAssignment({ user, language, onBack }: TaskAssignmentProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { tasks, loading, createTask, updateTask, deleteTask: removeTask } = useTasks();

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                           task.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleCreateTask = async (data: any) => {
    try {
      // Create task for each assigned student
      await Promise.all(
        data.assigned_students.map((userId: string) =>
          createTask({
            title: data.title,
            description: data.description,
            learning_module_id: data.learning_module_id,
            due_date: data.due_date.toISOString(),
            user_id: userId,
            status: 'OPEN',
          })
        )
      );
      toast.success('Aufgabe(n) erfolgreich erstellt');
    } catch (error) {
      toast.error('Fehler beim Erstellen der Aufgabe(n)');
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        learning_module_id: data.learning_module_id,
        due_date: data.due_date.toISOString(),
      });
      toast.success('Aufgabe erfolgreich aktualisiert');
      setEditingTask(null);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    
    try {
      await removeTask(deleteTaskId);
      toast.success('Aufgabe erfolgreich gelöscht');
      setDeleteTaskId(null);
    } catch (error) {
      toast.error('Fehler beim Löschen der Aufgabe');
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isToday(date)) return '🔥 Heute';
    if (isPast(date)) return `🔴 ${format(date, 'dd.MM.yyyy', { locale: de })}`;
    return format(date, 'dd.MM.yyyy', { locale: de });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <h1 className="text-3xl font-bold">Aufgaben verwalten</h1>
          </div>
          <Button onClick={() => { setEditingTask(null); setShowTaskDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Aufgaben..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="OPEN">Offen</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Bearbeitung</SelectItem>
                  <SelectItem value="DONE">Erledigt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Lade Aufgaben...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Keine Aufgaben gefunden</p>
                <Button onClick={() => setShowTaskDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Aufgabe erstellen
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aufgabe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fällig</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map(task => {
                      const status = statusConfig[task.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDueDate(task.due_date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTask({
                                    ...task,
                                    due_date: task.due_date ? new Date(task.due_date) : undefined,
                                    assigned_students: [task.user_id],
                                  });
                                  setShowTaskDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setDeleteTaskId(task.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskFormDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        defaultValues={editingTask}
        title={editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
      />

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aufgabe löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
