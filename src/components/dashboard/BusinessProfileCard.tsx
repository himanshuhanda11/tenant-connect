import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Building2, Phone, Copy, ExternalLink, Pencil, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BusinessProfileCardProps {
  businessName: string;
  businessId?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  freeConversations?: { used: number; limit: number };
  credits?: { balance: number; currency: string };
  loading?: boolean;
  onViewProfile?: () => void;
  onEdit?: () => void;
}

export function BusinessProfileCard({
  businessName,
  businessId,
  phoneNumber,
  profilePictureUrl,
  freeConversations,
  credits,
  loading,
  onViewProfile,
  onEdit,
}: BusinessProfileCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

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

  const conversationPercentage = freeConversations
    ? (freeConversations.used / freeConversations.limit) * 100
    : 0;

  return (
    <Card className="border-0 shadow-soft bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Business Profile
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={businessName}
              className="h-14 w-14 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{businessName}</h3>
            {businessId && (
              <p className="text-xs text-muted-foreground">{businessId}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        {phoneNumber && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">{phoneNumber}</span>
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

        {/* View Profile Link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={onViewProfile}
        >
          <span>View Profile</span>
          <ExternalLink className="h-4 w-4" />
        </Button>

        {/* Free Conversations */}
        {freeConversations && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Free Service Conversations
              </span>
              <span className="text-xs text-muted-foreground">
                {freeConversations.limit === Infinity ? 'Unlimited' : `${freeConversations.used}/${freeConversations.limit}`}
              </span>
            </div>
            <Progress value={conversationPercentage} className="h-2" />
          </div>
        )}

        {/* Credits Balance */}
        {credits && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Conversation Credits</p>
              <p className="text-lg font-bold text-foreground">
                {credits.currency} {credits.balance.toLocaleString()}
              </p>
            </div>
            <Button variant="default" size="sm">
              Buy More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
