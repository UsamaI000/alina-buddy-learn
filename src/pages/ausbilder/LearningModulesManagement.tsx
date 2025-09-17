import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from '@/types/auth';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  apprenticeship: string;
  created_at: string;
  updated_at: string;
}

interface LearningModulesManagementProps {
  user: AppUser;
  language: string;
  onBack: () => void;
}

export default function LearningModulesManagement({ user, language, onBack }: LearningModulesManagementProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    apprenticeship: ''
  });
  const { toast } = useToast();

  const t = {
    de: {
      title: 'Lerninhalte verwalten',
      subtitle: 'Erstelle und bearbeite Lernmodule',
      search: 'Suchen...',
      back: 'Zurück',
      addModule: 'Neues Modul',
      editModule: 'Modul bearbeiten',
      moduleTitle: 'Titel',
      moduleDescription: 'Beschreibung',
      apprenticeship: 'Ausbildungsrichtung',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      noModules: 'Keine Lernmodule gefunden',
      created: 'Erstellt',
      updated: 'Aktualisiert'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: 'Fehler',
        description: 'Lernmodule konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.apprenticeship) {
      toast({
        title: 'Fehler',
        description: 'Titel und Ausbildungsrichtung sind erforderlich.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingModule) {
        const { error } = await supabase
          .from('learning_modules')
          .update(formData)
          .eq('id', editingModule.id);

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Lernmodul wurde aktualisiert.'
        });
      } else {
        const { error } = await supabase
          .from('learning_modules')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Lernmodul wurde erstellt.'
        });
      }

      setIsDialogOpen(false);
      setEditingModule(null);
      setFormData({ title: '', description: '', apprenticeship: '' });
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      toast({
        title: 'Fehler',
        description: 'Lernmodul konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Möchten Sie dieses Lernmodul wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Lernmodul wurde gelöscht.'
      });
      
      fetchModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: 'Fehler',
        description: 'Lernmodul konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (module: LearningModule) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      apprenticeship: module.apprenticeship
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingModule(null);
    setFormData({ title: '', description: '', apprenticeship: '' });
    setIsDialogOpen(true);
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.apprenticeship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Lernmodule...</p>
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
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {texts.title}
              </h1>
              <p className="text-muted-foreground">
                {texts.subtitle}
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {texts.addModule}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingModule ? texts.editModule : texts.addModule}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.moduleTitle}</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z.B. Grundlagen der Programmierung"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{texts.apprenticeship}</label>
                    <Input
                      value={formData.apprenticeship}
                      onChange={(e) => setFormData(prev => ({ ...prev, apprenticeship: e.target.value }))}
                      placeholder="z.B. Fachinformatiker Anwendungsentwicklung"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{texts.moduleDescription}</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreibung des Lernmoduls..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      {texts.save}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      {texts.cancel}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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

        {filteredModules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{texts.noModules}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="truncate">{module.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(module)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(module.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary">{module.apprenticeship}</Badge>
                  
                  {module.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {module.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{texts.created}: {new Date(module.created_at).toLocaleDateString('de-DE')}</div>
                    <div>{texts.updated}: {new Date(module.updated_at).toLocaleDateString('de-DE')}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}