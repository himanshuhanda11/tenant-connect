import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, Phone, Copy, ExternalLink, Pencil, Wifi, WifiOff, Shield, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import dashboardWhatsappProfile from '@/assets/dashboard-whatsapp-profile.png';

interface BusinessProfileCardProps {
  businessName: string;
  businessId?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isWABAConnected?: boolean;
  qualityRating?: 'green' | 'yellow' | 'red' | 'unknown';
  loading?: boolean;
  onViewProfile?: () => void;
  onEdit?: () => void;
  onConnect?: () => void;
}

export function BusinessProfileCard({
  businessName,
  businessId,
  phoneNumber,
  profilePictureUrl,
  isWABAConnected = false,
  qualityRating = 'unknown',
  loading,
  onViewProfile,
  onEdit,
  onConnect,
}: BusinessProfileCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const qualityConfig = {
    green: { label: 'Good', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-500/10', tooltip: 'Your account is in good standing. Keep up the quality!' },
    yellow: { label: 'Medium', dotColor: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-500/10', tooltip: 'Quality needs attention. Avoid spam reports.' },
    red: { label: 'Low', dotColor: 'bg-destructive', textColor: 'text-destructive', bgColor: 'bg-destructive/10', tooltip: 'Action required! Your messaging limits may be reduced.' },
    unknown: { label: 'N/A', dotColor: 'bg-muted-foreground', textColor: 'text-muted-foreground', bgColor: 'bg-muted', tooltip: 'Connect WhatsApp to see quality rating.' },
  };

  const qc = qualityConfig[qualityRating];

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            WhatsApp Business
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Illustration + WABA Status */}
        <div className="flex items-center gap-3 mb-1">
          <img 
            src={dashboardWhatsappProfile} 
            alt="WhatsApp Business" 
            className="h-16 w-16 object-contain flex-shrink-0"
            loading="lazy"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">{businessName}</h3>
            {businessId && (
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{businessId}</p>
            )}
          </div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-3 py-1 text-xs rounded-lg shadow-sm">
              LIVE
            </Badge>
          ) : (
            <Button size="sm" onClick={onConnect} className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
              <Zap className="h-3 w-3 mr-1" />
              Connect
            </Button>
          )}
        </div>

        {/* API Status row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              isWABAConnected ? "bg-emerald-500/10" : "bg-muted"
            )}>
              {isWABAConnected ? (
                <Wifi className="h-4 w-4 text-emerald-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">API Status</p>
            </div>
          </div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-3 py-1 text-xs rounded-lg shadow-sm">
              LIVE
            </Badge>
          ) : (
            <Button size="sm" onClick={onConnect} className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
              <Zap className="h-3 w-3 mr-1" />
              Connect
            </Button>
          )}
        </div>

        {/* Profile Header removed - now in illustration section above */}

        {/* Phone Number */}
        {phoneNumber && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary text-sm">{phoneNumber}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => copyToClipboard(phoneNumber)}
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}

        {/* Quality Rating */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Shield className={cn("h-4 w-4", qc.textColor)} />
            <span className="text-xs font-medium text-muted-foreground">Quality Rating</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className={cn("h-2 w-2 rounded-full", qc.dotColor)} />
                <span className={cn("text-xs font-bold", qc.textColor)}>{qc.label}</span>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="text-xs">{qc.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* View Settings Link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={onViewProfile}
        >
          <span>View WhatsApp Settings</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
