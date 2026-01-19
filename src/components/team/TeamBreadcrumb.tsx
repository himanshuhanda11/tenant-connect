import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const teamRoutes = [
  { path: '/team', label: 'Overview' },
  { path: '/team/overview', label: 'Overview' },
  { path: '/team/members', label: 'Members' },
  { path: '/team/roles', label: 'Roles & Permissions' },
  { path: '/team/groups', label: 'Teams (Groups)' },
  { path: '/team/routing', label: 'Routing & Assignment' },
  { path: '/team/sla', label: 'Working Hours & SLA' },
  { path: '/team/audit', label: 'Audit Logs' },
];

interface TeamBreadcrumbProps {
  currentPage: string;
}

export function TeamBreadcrumb({ currentPage }: TeamBreadcrumbProps) {
  const location = useLocation();
  const isOverview = location.pathname === '/team' || location.pathname === '/team/overview';

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          {isOverview ? (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Team
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/team" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Users className="h-4 w-4" />
                Team
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isOverview && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export { teamRoutes };
