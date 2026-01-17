import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface ServiceStatus {
  name: string;
  status: StatusType;
}

const services: ServiceStatus[] = [
  { name: 'API', status: 'operational' },
  { name: 'Webhooks', status: 'operational' },
  { name: 'Dashboard', status: 'operational' },
  { name: 'Messaging', status: 'operational' }
];

const statusConfig: Record<StatusType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  operational: { 
    icon: CheckCircle, 
    label: 'All Systems Operational', 
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/20'
  },
  degraded: { 
    icon: AlertTriangle, 
    label: 'Degraded Performance', 
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  outage: { 
    icon: XCircle, 
    label: 'Service Outage', 
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20'
  },
  maintenance: { 
    icon: Circle, 
    label: 'Scheduled Maintenance', 
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20'
  }
};

export function ApiStatusBadge() {
  const [overallStatus, setOverallStatus] = useState<StatusType>('operational');

  useEffect(() => {
    // Calculate overall status based on services
    const hasOutage = services.some(s => s.status === 'outage');
    const hasDegraded = services.some(s => s.status === 'degraded');
    const hasMaintenance = services.some(s => s.status === 'maintenance');

    if (hasOutage) setOverallStatus('outage');
    else if (hasDegraded) setOverallStatus('degraded');
    else if (hasMaintenance) setOverallStatus('maintenance');
    else setOverallStatus('operational');
  }, []);

  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
      config.bg
    )}>
      <Icon className={cn("w-4 h-4", config.color)} />
      <span className={config.color}>{config.label}</span>
    </div>
  );
}

export function ApiStatusCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">System Status</h3>
        <a 
          href="#" 
          className="text-sm text-primary hover:underline"
        >
          View Status Page →
        </a>
      </div>
      
      <div className="space-y-3">
        {services.map((service) => {
          const config = statusConfig[service.status];
          const Icon = config.icon;
          
          return (
            <div key={service.name} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{service.name}</span>
              <div className="flex items-center gap-1.5">
                <Icon className={cn("w-3.5 h-3.5", config.color)} />
                <span className={cn("text-xs font-medium", config.color)}>
                  {service.status === 'operational' ? 'Operational' : config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
