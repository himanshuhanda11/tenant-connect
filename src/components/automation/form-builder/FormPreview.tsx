import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Star, Upload, MapPin, ShieldCheck, Clock, Calculator,
  EyeOff, Tag, TrendingUp, CheckCircle2, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormField, FormBuilderState } from './types';
import { FIELD_ICON_MAP } from './field-config';

interface FormPreviewProps {
  state: FormBuilderState;
  whatsappStyle?: boolean;
}

// Internal/smart fields that are auto-processed and should NOT be shown to the end user
const INTERNAL_FIELD_TYPES = new Set(['hidden', 'lead_score', 'tag_assignment', 'calculated']);

export function FormPreview({ state, whatsappStyle = false }: FormPreviewProps) {
  const { fields, formName, settings } = state;
  const totalSteps = settings.multiStep ? Math.max(...fields.map(f => f.step || 1), 1) : 1;
  const [currentStep, setCurrentStep] = useState(1);
  
  const visibleFields = (settings.multiStep
    ? fields.filter(f => (f.step || 1) === currentStep)
    : fields
  ).filter(f => !INTERNAL_FIELD_TYPES.has(f.type));

  if (whatsappStyle) {
    return (
      <div className="max-w-sm mx-auto">
        {/* WhatsApp-style phone frame */}
        <div className="bg-[#0b141a] rounded-[2rem] p-2 shadow-2xl">
          <div className="bg-[#efeae2] rounded-[1.5rem] overflow-hidden">
            {/* Status bar */}
            <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Aireatro</p>
                <p className="text-white/70 text-[10px]">online</p>
              </div>
            </div>
            {/* Chat area */}
            <div className="p-3 space-y-2 min-h-[300px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlZmVhZTIiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZDVkMGM4Ii8+PC9zdmc+')] bg-repeat">
              {/* Bot message */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                  <p className="text-sm text-gray-800 font-medium mb-2">{formName || 'Form'}</p>
                  {visibleFields.map(field => (
                    <div key={field.id} className="mb-2 last:mb-0">
                      <p className="text-[11px] text-gray-500 mb-0.5">{field.label}{field.required ? ' *' : ''}</p>
                      <div className="bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-400">
                        {field.type === 'rating' ? '⭐⭐⭐⭐⭐' :
                         field.type === 'file_upload' ? '📎 Tap to upload' :
                         field.type === 'location' ? '📍 Share location' :
                         field.type === 'otp_verification' ? '🔐 Enter OTP' :
                         field.type === 'time_slot' ? '🕐 Select time' :
                         field.type === 'calculated' ? '🔢 Auto-calculated' :
                         field.type === 'lead_score' ? '📊 Select option' :
                         field.type === 'tag_assignment' ? '🏷 Select option' :
                         field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="bg-[#25d366] text-white text-center py-1.5 rounded text-xs font-medium">
                      {settings.submitButtonText || 'Submit'}
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1 text-right">12:00 PM ✓✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <CardContent className="p-4 space-y-4">
        <div className="text-center mb-2">
          <h3 className="font-semibold text-base">{formName || 'Untitled Form'}</h3>
          {state.description && <p className="text-xs text-muted-foreground">{state.description}</p>}
        </div>

        {/* Multi-step progress */}
        {settings.multiStep && totalSteps > 1 && settings.showProgressBar && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-1.5" />
          </div>
        )}

        {visibleFields.map(field => {
          const Icon = FIELD_ICON_MAP[field.type];
          return (
            <div key={field.id} className={cn("space-y-1.5", field.width === 'half' && 'w-1/2 inline-block pr-2')}>
              <Label className="text-sm flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}

              {field.type === 'textarea' ? (
                <div className="h-16 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">{field.placeholder || 'Type here...'}</div>
              ) : field.type === 'select' || field.type === 'tag_assignment' || field.type === 'lead_score' ? (
                <div className="space-y-1">
                  <div className="h-10 rounded-md border border-border bg-background px-3 flex items-center text-sm text-muted-foreground">
                    Select {field.label.toLowerCase()}...
                  </div>
                  {field.type === 'lead_score' && (
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[8px]">🔥 Hot</Badge>
                      <Badge variant="outline" className="text-[8px]">🌤 Warm</Badge>
                      <Badge variant="outline" className="text-[8px]">❄️ Cold</Badge>
                    </div>
                  )}
                </div>
              ) : field.type === 'radio' ? (
                <div className="space-y-1.5">
                  {(field.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                      <span className="text-sm">{opt.label}</span>
                    </div>
                  ))}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-1.5">
                  {(field.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-border" />
                      <span className="text-sm">{opt.label}</span>
                    </div>
                  ))}
                </div>
              ) : field.type === 'rating' ? (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-6 h-6 text-muted-foreground/30" />)}
                </div>
              ) : field.type === 'file_upload' ? (
                <div className="h-20 rounded-md border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Drag & drop or click to upload</span>
                  {field.fileTypes && <span className="text-[10px]">{field.fileTypes.join(', ')}</span>}
                </div>
              ) : field.type === 'location' ? (
                <div className="h-12 rounded-md border border-border bg-background px-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Enter address or share location</span>
                </div>
              ) : field.type === 'otp_verification' ? (
                <div className="flex items-center gap-2">
                  <Input disabled placeholder="Enter OTP" className="h-10 flex-1" />
                  <Button disabled size="sm" variant="outline"><ShieldCheck className="w-4 h-4 mr-1" /> Verify</Button>
                </div>
              ) : field.type === 'time_slot' ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map(t => (
                    <div key={t} className="text-xs text-center py-1.5 rounded border border-border bg-background text-muted-foreground">{t}</div>
                  ))}
                </div>
              ) : field.type === 'calculated' ? (
                <div className="h-10 rounded-md border border-border bg-muted/50 px-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="w-4 h-4" />
                  <span>Auto-calculated</span>
                </div>
              ) : (
                <Input disabled placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} className="h-10" />
              )}
            </div>
          );
        })}

        {/* Multi-step navigation */}
        {settings.multiStep && totalSteps > 1 ? (
          <div className="flex items-center justify-between pt-2">
            <Button disabled={currentStep <= 1} variant="outline" size="sm" onClick={() => setCurrentStep(s => s - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {currentStep < totalSteps ? (
              <Button size="sm" onClick={() => setCurrentStep(s => s + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button disabled size="sm">{settings.submitButtonText || 'Submit'}</Button>
            )}
          </div>
        ) : (
          <Button disabled className="w-full mt-2">{settings.submitButtonText || 'Submit'}</Button>
        )}
      </CardContent>
    </Card>
  );
}
