import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, ExternalLink, Code2, User } from 'lucide-react';
import { toast } from 'sonner';
import dashboardProfile from '@/assets/dashboard-profile.png';
import dashboardWaLink from '@/assets/dashboard-wa-link.png';
import dashboardWidget from '@/assets/dashboard-widget.png';

interface WhatsAppLinksCardProps {
  phoneNumber?: string;
  businessName?: string;
  loading?: boolean;
}

export function WhatsAppLinksCard({ phoneNumber, businessName, loading }: WhatsAppLinksCardProps) {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  const cleanPhone = phoneNumber?.replace(/[^0-9]/g, '') || '';
  const waLink = `https://wa.me/${cleanPhone}`;
  const widgetCode = `<a href="${waLink}" target="_blank" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;padding:14px 20px;border-radius:50px;text-decoration:none;font-family:sans-serif;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.15);z-index:9999;display:flex;align-items:center;gap:8px;">💬 Chat on WhatsApp</a>`;

  const copyToClipboard = (text: string, type: 'link' | 'widget') => {
    navigator.clipboard.writeText(text);
    toast.success(type === 'link' ? 'WhatsApp link copied!' : 'Widget code copied!');
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedWidget(true);
      setTimeout(() => setCopiedWidget(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Quick Links & Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Business Profile */}
        <button
          onClick={() => navigate('/phone-numbers?tab=profile')}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/10 hover:border-primary/25 transition-all group"
        >
          <img src={dashboardProfile} alt="Profile" className="h-14 w-14 object-contain flex-shrink-0 group-hover:scale-105 transition-transform" loading="lazy" />
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{businessName || 'Business Profile'}</p>
            <p className="text-xs text-muted-foreground truncate">{phoneNumber || 'Not connected'}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            <User className="h-3 w-3 mr-1" /> Edit
          </Badge>
        </button>

        {/* WhatsApp Link */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/8 to-emerald-500/3 border border-emerald-500/10">
          <img src={dashboardWaLink} alt="WA Link" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">WhatsApp Me Link</p>
            <p className="text-xs text-muted-foreground truncate font-mono">{phoneNumber ? waLink : 'Connect phone first'}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg"
              onClick={() => copyToClipboard(waLink, 'link')}
              disabled={!phoneNumber}
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg"
              onClick={() => window.open(waLink, '_blank')}
              disabled={!phoneNumber}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Website Widget */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/8 to-blue-500/3 border border-blue-500/10">
          <img src={dashboardWidget} alt="Widget" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Website Chat Button</p>
            <p className="text-xs text-muted-foreground">Add WhatsApp button to your site</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 rounded-lg text-xs shrink-0"
            onClick={() => copyToClipboard(widgetCode, 'widget')}
            disabled={!phoneNumber}
          >
            {copiedWidget ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Code2 className="h-3.5 w-3.5 mr-1" />}
            {copiedWidget ? 'Copied' : 'Copy Code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
