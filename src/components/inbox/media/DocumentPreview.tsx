import { FileText, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DocumentPreviewProps {
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isOutbound?: boolean;
  caption?: string;
}

function getDocInfo(mimeType?: string, fileName?: string) {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (mimeType?.includes('pdf') || ext === 'pdf') {
    return { icon: FileText, label: 'PDF', color: 'text-red-500', bg: 'bg-red-50' };
  }
  if (mimeType?.includes('word') || mimeType?.includes('document') || ext === 'doc' || ext === 'docx') {
    return { icon: FileText, label: 'DOC', color: 'text-blue-500', bg: 'bg-blue-50' };
  }
  if (mimeType?.includes('sheet') || mimeType?.includes('excel') || ext === 'xls' || ext === 'xlsx') {
    return { icon: FileSpreadsheet, label: 'XLS', color: 'text-green-600', bg: 'bg-green-50' };
  }
  if (mimeType?.includes('presentation') || ext === 'ppt' || ext === 'pptx') {
    return { icon: FileText, label: 'PPT', color: 'text-orange-500', bg: 'bg-orange-50' };
  }
  return { icon: FileText, label: 'FILE', color: 'text-muted-foreground', bg: 'bg-muted' };
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractFileName(url: string, fallback?: string): string {
  if (fallback) return fallback;
  try {
    const path = new URL(url).pathname;
    const name = path.split('/').pop();
    if (name && name.includes('.')) return decodeURIComponent(name);
  } catch {}
  return 'Document';
}

export function DocumentPreview({ url, fileName, fileSize, mimeType, isOutbound, caption }: DocumentPreviewProps) {
  const [failed, setFailed] = useState(false);
  const isValid = url?.startsWith('http') || url?.startsWith('blob:');
  const displayName = extractFileName(url, fileName);
  const doc = getDocInfo(mimeType, displayName);
  const Icon = doc.icon;
  const size = formatSize(fileSize);

  if (failed) {
    return (
      <button
        onClick={() => setFailed(false)}
        className={cn(
          "flex items-center gap-3 w-full rounded-xl p-3 mb-1 transition-colors",
          isOutbound ? "bg-primary-foreground/10 hover:bg-primary-foreground/15" : "bg-background/80 hover:bg-background"
        )}
      >
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className={cn("text-sm font-medium truncate", isOutbound ? "text-primary-foreground" : "text-foreground")}>
            Tap to reload
          </p>
          <p className={cn("text-xs", isOutbound ? "text-primary-foreground/60" : "text-muted-foreground")}>
            File may have expired
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="mb-1">
      <a
        href={isValid ? url : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => { if (!isValid) { e.preventDefault(); setFailed(true); } }}
        className={cn(
          "flex items-center gap-3 rounded-xl p-3 no-underline transition-colors group",
          isOutbound 
            ? "bg-primary-foreground/10 hover:bg-primary-foreground/15" 
            : "bg-background/80 hover:bg-background border border-border/50"
        )}
      >
        {/* File type icon */}
        <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0", doc.bg)}>
          <Icon className={cn("h-5 w-5", doc.color)} />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", isOutbound ? "text-primary-foreground" : "text-foreground")}>
            {displayName}
          </p>
          <p className={cn("text-xs mt-0.5", isOutbound ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {doc.label}{size ? ` · ${size}` : ''}
          </p>
        </div>

        {/* Download icon */}
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity",
          isOutbound ? "bg-primary-foreground/10" : "bg-muted"
        )}>
          <Download className={cn("h-4 w-4", isOutbound ? "text-primary-foreground" : "text-muted-foreground")} />
        </div>
      </a>
      {caption && (
        <p className={cn("text-sm whitespace-pre-wrap mt-1.5 px-1", isOutbound ? "text-primary-foreground" : "text-foreground")}>
          {caption}
        </p>
      )}
    </div>
  );
}
