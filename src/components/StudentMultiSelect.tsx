import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, CheckSquare, Square } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  user_id: string;
}

interface StudentMultiSelectProps {
  selectedStudents: string[];
  onChange: (students: string[]) => void;
  apprenticeship?: string;
}

export function StudentMultiSelect({ selectedStudents, onChange, apprenticeship }: StudentMultiSelectProps) {
  const [students, setStudents] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [apprenticeship]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id, apprenticeship')
        .order('first_name', { ascending: true });

      if (apprenticeship) {
        query = query.eq('apprenticeship', apprenticeship);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleToggle = (userId: string) => {
    if (selectedStudents.includes(userId)) {
      onChange(selectedStudents.filter(id => id !== userId));
    } else {
      onChange([...selectedStudents, userId]);
    }
  };

  const handleSelectAll = () => {
    onChange(filteredStudents.map(s => s.user_id));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Lade Auszubildende...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Alle
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDeselectAll}
        >
          <Square className="h-4 w-4 mr-1" />
          Keine
        </Button>
      </div>

      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedStudents.map(userId => {
            const student = students.find(s => s.user_id === userId);
            if (!student) return null;
            return (
              <Badge key={userId} variant="secondary">
                {student.first_name} {student.last_name}
              </Badge>
            );
          })}
        </div>
      )}

      <ScrollArea className="h-[200px] border rounded-md p-4">
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Auszubildende gefunden</p>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`student-${student.user_id}`}
                  checked={selectedStudents.includes(student.user_id)}
                  onCheckedChange={() => handleToggle(student.user_id)}
                />
                <Label
                  htmlFor={`student-${student.user_id}`}
                  className="cursor-pointer flex-1"
                >
                  {student.first_name} {student.last_name}
                </Label>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selectedStudents.length} von {students.length} ausgewählt
      </p>
    </div>
  );
}
