import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  MessageSquare,
  FileText,
  Info,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Template } from '@/types/template';

interface FallbackPolicyCardProps {
  templateId: string;
  templateStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED';
  approvedTemplates: Template[];
  fallbackEnabled: boolean;
  fallbackTemplateId?: string;
  useSessionMessage: boolean;
  onFallbackEnabledChange: (enabled: boolean) => void;
  onFallbackTemplateChange: (templateId: string) => void;
  onUseSessionMessageChange: (enabled: boolean) => void;
  className?: string;
}

export function FallbackPolicyCard({
  templateId,
  templateStatus,
  approvedTemplates,
  fallbackEnabled,
  fallbackTemplateId,
  useSessionMessage,
  onFallbackEnabledChange,
  onFallbackTemplateChange,
  onUseSessionMessageChange,
  className,
}: FallbackPolicyCardProps) {
  const isNotApproved = templateStatus !== 'APPROVED';
  const availableFallbacks = approvedTemplates.filter(t => t.id !== templateId);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Fallback Policy
        </CardTitle>
        <CardDescription className="text-xs">
          What happens if this template isn't approved when you try to send?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable Fallback */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label className="text-sm font-medium">Enable Fallback</Label>
              <p className="text-xs text-muted-foreground">Use alternatives if template unavailable</p>
            </div>
          </div>
          <Switch
            checked={fallbackEnabled}
            onCheckedChange={onFallbackEnabledChange}
          />
        </div>

        {fallbackEnabled && (
          <>
            {/* Session Message Priority */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Use 24h Session Window</Label>
                  <p className="text-xs text-blue-700">
                    Send as regular message if within 24h window
                  </p>
                </div>
              </div>
              <Switch
                checked={useSessionMessage}
                onCheckedChange={onUseSessionMessageChange}
              />
            </div>

            {/* Backup Template Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Backup Template</Label>
              <Select value={fallbackTemplateId} onValueChange={onFallbackTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a backup template" />
                </SelectTrigger>
                <SelectContent>
                  {availableFallbacks.length === 0 ? (
                    <SelectItem value="" disabled>No approved templates available</SelectItem>
                  ) : (
                    availableFallbacks.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{template.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {template.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used if session window expired and primary template unavailable
              </p>
            </div>

            {/* Fallback Flow Visualization */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fallback Flow
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Primary
                </Badge>
                <span className="text-muted-foreground">→</span>
                {useSessionMessage && (
                  <>
                    <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700">
                      <MessageSquare className="h-3 w-3" />
                      Session
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                  </>
                )}
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Backup
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* Info Alert */}
        {isNotApproved && (
          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-xs">
              This template is {templateStatus.toLowerCase()}. Consider setting up a fallback to ensure message delivery.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
