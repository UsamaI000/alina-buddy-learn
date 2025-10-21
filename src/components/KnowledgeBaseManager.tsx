import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trash2, BookOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface KnowledgeBaseManagerProps {
  learningModuleId: string;
  learningModuleName: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  created_at: string;
  chunk_count: number;
}

export function KnowledgeBaseManager({ learningModuleId, learningModuleName }: KnowledgeBaseManagerProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [learningModuleId]);

  const fetchArticles = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, title, content, created_at')
        .eq('learning_module_id', learningModuleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by title and count chunks
      const grouped = data.reduce((acc, item) => {
        const existing = acc.find(a => a.title === item.title);
        if (existing) {
          existing.chunk_count++;
        } else {
          acc.push({
            id: item.id,
            title: item.title,
            content: item.content,
            created_at: item.created_at,
            chunk_count: 1
          });
        }
        return acc;
      }, [] as KnowledgeArticle[]);

      setArticles(grouped);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Fehler beim Laden der Artikel');
    } finally {
      setIsFetching(false);
    }
  };

  const handleIngest = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Bitte Titel und Inhalt eingeben');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ingest-knowledge', {
        body: {
          learning_module_id: learningModuleId,
          title: title.trim(),
          content: content.trim(),
          metadata: {
            learning_module_name: learningModuleName
          }
        }
      });

      if (error) throw error;

      toast.success(`${data.chunks_created} Chunks erfolgreich erstellt!`);
      setTitle('');
      setContent('');
      fetchArticles();
    } catch (error) {
      console.error('Ingestion error:', error);
      toast.error('Fehler beim Speichern des Artikels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (articleTitle: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('learning_module_id', learningModuleId)
        .eq('title', articleTitle);

      if (error) throw error;

      toast.success('Artikel gelöscht');
      fetchArticles();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wissensartikel hinzufügen</CardTitle>
          <CardDescription>
            Modul: {learningModuleName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Titel</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Grundlagen der Elektrotechnik"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Inhalt</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Fügen Sie hier den Lerninhalt ein... Der Text wird automatisch in Chunks aufgeteilt und für die KI-Suche optimiert."
              rows={12}
            />
          </div>
          <Button onClick={handleIngest} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Verarbeite...' : 'Artikel speichern'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Vorhandene Wissensartikel</h3>
        {isFetching ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Noch keine Wissensartikel vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{article.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.chunk_count} Chunk{article.chunk_count !== 1 ? 's' : ''} • {new Date(article.created_at).toLocaleDateString('de-DE')}
                    </p>
                    <p className="text-sm mt-2 line-clamp-2">{article.content.substring(0, 200)}...</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchten Sie "{article.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(article.title)}>
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
