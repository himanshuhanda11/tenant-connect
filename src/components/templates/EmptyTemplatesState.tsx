import { FileText, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTemplatesStateProps {
  onCreateNew: () => void;
  onBrowseIndustry: () => void;
}

export function EmptyTemplatesState({ onCreateNew, onBrowseIndustry }: EmptyTemplatesStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your first WhatsApp message template or browse our industry-specific templates to get started quickly.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBrowseIndustry}>
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Industry Templates
        </Button>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Template
        </Button>
      </div>
    </div>
  );
}
