import { useState, ReactNode } from 'react';
import { CrmSidebar } from './CrmSidebar';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutGrid, Users, Inbox, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { label: 'Pipeline', to: '/crm/pipelines', icon: LayoutGrid },
  { label: 'Contacts', to: '/contacts', icon: Users },
  { label: 'Inbox', to: '/inbox', icon: Inbox },
];

export function CrmLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-muted/30 text-foreground">
      {/* Desktop sidebar */}
      <CrmSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-2 h-14 px-3 border-b border-border/60 bg-card/95 backdrop-blur sticky top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-[hsl(222_47%_8%)] border-r border-white/5">
              <CrmSidebar collapsed={false} onToggle={() => {}} />
            </SheetContent>
          </Sheet>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-bold text-sm">CRM</span>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-3.5 w-3.5" /> App
          </Button>
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-3">
            {MOBILE_NAV.map(item => {
              const active = pathname === item.to || pathname.startsWith(item.to + '/');
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className={cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}>
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
