import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  CreditCard, 
  Download, 
  Users,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function BillingQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/billing/plans">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <span>Upgrade Plan</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/billing/payment-methods">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Add Payment</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/billing/invoices">
              <Download className="h-5 w-5 text-primary" />
              <span>Download Invoice</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/team/members">
              <Users className="h-5 w-5 text-primary" />
              <span>Manage Seats</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
