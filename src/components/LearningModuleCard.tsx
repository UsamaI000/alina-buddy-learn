import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { getTranslation, type Language } from '@/utils/i18n';

type LearningModule = Database['public']['Tables']['learning_modules']['Row'];

interface LearningModuleCardProps {
  module: LearningModule;
  onStart: (moduleId: string) => void;
  language?: string;
}

export function LearningModuleCard({ module, onStart, language = 'de' }: LearningModuleCardProps) {
  const texts = getTranslation('learningModuleCard', language as Language);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            {module.title}
          </CardTitle>
          <Badge variant="secondary">{module.apprenticeship}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {module.description || texts.noDescription}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{texts.created}: {new Date(module.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-GB')}</span>
          </div>
          <Button 
            size="sm" 
            onClick={() => onStart(module.id)}
          >
            {texts.startLearning}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}