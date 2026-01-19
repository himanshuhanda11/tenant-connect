import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Type,
  Link,
  MessageSquare,
  Shield,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export function TemplateStyleGuide() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Template Approval Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          {/* Category Selection */}
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Choosing the Right Category
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p className="text-muted-foreground">
                Most rejections happen due to category mismatch. Choose wisely:
              </p>
              
              <div className="space-y-2">
                <div className="p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <Badge variant="outline" className="text-green-700 border-green-300 mb-1">UTILITY</Badge>
                  <p className="text-xs">Order confirmations, shipping updates, appointment reminders, payment receipts</p>
                </div>
                
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Badge variant="outline" className="text-blue-700 border-blue-300 mb-1">MARKETING</Badge>
                  <p className="text-xs">Promotions, offers, discounts, upsells, newsletters, reactivation campaigns</p>
                </div>
                
                <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <Badge variant="outline" className="text-purple-700 border-purple-300 mb-1">AUTHENTICATION</Badge>
                  <p className="text-xs">OTP codes, verification codes, password resets (must include {'{{1}}'} for code)</p>
                </div>
              </div>
              
              <Alert className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  If it contains an offer/discount/limited time → it's <strong>MARKETING</strong>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          {/* Variables */}
          <AccordionItem value="variables">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Variables & Examples
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700">Good</p>
                    <p className="text-xs text-muted-foreground">
                      Hello {'{{1}}'}, your order {'{{2}}'} is shipped.<br />
                      Examples: {'{{1}}'}=Himanshu, {'{{2}}'}=ORD-10293
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Bad</p>
                    <p className="text-xs text-muted-foreground">
                      Hello {'{{1}}'}, your {'{{2}}'} is ready. (too vague)
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Always provide realistic example values that match your use case.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Formatting */}
          <AccordionItem value="formatting">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Language & Formatting
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p className="text-muted-foreground">Avoid these for your first few templates:</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  Too many emojis
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  ALL CAPS text
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  "BUY NOW!!!"
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  Multiple !!! or ???
                </div>
              </div>
              
              <Alert className="py-2">
                <AlertDescription className="text-xs">
                  <strong>Utility templates should not sound promotional.</strong><br />
                  ❌ "Your order is confirmed — upgrade now for discount!"<br />
                  ✅ "Your order #12345 is confirmed. Delivery: Tomorrow."
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          {/* Links & Buttons */}
          <AccordionItem value="links">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Link className="h-4 w-4 text-primary" />
                Links & Buttons
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-xs">Direct HTTPS link to your domain</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-xs">0-2 buttons, keep text simple</p>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-xs">URL shorteners (bit.ly, tinyurl)</p>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-xs">Redirect chains or suspicious domains</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Common Rejections */}
          <AccordionItem value="rejections">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Common Rejection Reasons
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Category mismatch (most common)</li>
                <li>• Vague or missing variable examples</li>
                <li>• Too promotional for Utility category</li>
                <li>• URL issues (shorteners, redirects)</li>
                <li>• Policy-violating content</li>
                <li>• Missing OTP variable for Authentication</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* What AiReatro Does */}
          <AccordionItem value="features">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How We Help
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✨ Auto-detect best category</li>
                <li>📊 Approval readiness score</li>
                <li>🔧 AI rewrite suggestions</li>
                <li>📝 Example value generator</li>
                <li>🔄 Post-rejection "Fix & Resubmit" flow</li>
                <li>⏱️ Status timeline with Meta updates</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}