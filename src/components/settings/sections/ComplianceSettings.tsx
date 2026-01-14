import React from 'react';
import { FileCheck, Download, Trash2, Shield, Clock, Globe, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ComplianceSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                GDPR Compliance
              </CardTitle>
              <CardDescription>Manage data protection and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">GDPR Compliant</h4>
                    <p className="text-sm text-muted-foreground">All required controls are enabled</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-0">Compliant</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consent Collection</Label>
                  <p className="text-sm text-muted-foreground">Require explicit consent before messaging</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Right to Access</Label>
                  <p className="text-sm text-muted-foreground">Allow contacts to request their data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Right to Erasure</Label>
                  <p className="text-sm text-muted-foreground">Allow contacts to request data deletion</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Data Export
              </CardTitle>
              <CardDescription>Export your workspace data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Export Contacts</span>
                  <span className="text-xs text-muted-foreground">CSV or JSON</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Export Messages</span>
                  <span className="text-xs text-muted-foreground">CSV or JSON</span>
                </Button>
              </div>
              <Button variant="outline" className="w-full">Export All Data (Full Archive)</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-primary" />
                Deletion Requests
              </CardTitle>
              <CardDescription>Manage data deletion requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/30 text-center">
                <p className="text-muted-foreground">No pending deletion requests</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-process Deletion</Label>
                  <p className="text-sm text-muted-foreground">Automatically process requests after 30 days</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Consent Logs
              </CardTitle>
              <CardDescription>Track all consent events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { action: 'Opt-in', contact: '+1 555-0123', date: '2 hours ago' },
                  { action: 'Opt-out', contact: '+1 555-0456', date: '1 day ago' },
                  { action: 'Opt-in', contact: '+1 555-0789', date: '3 days ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.action === 'Opt-in' ? 'default' : 'outline'}>{log.action}</Badge>
                      <span className="font-mono text-sm">{log.contact}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{log.date}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Logs</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Data Retention
              </CardTitle>
              <CardDescription>Configure how long data is kept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Message Retention</Label>
                  <Select defaultValue="365">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Retention</Label>
                  <Select defaultValue="forever">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="365">1 year after last contact</SelectItem>
                      <SelectItem value="730">2 years after last contact</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-delete Inactive Contacts</Label>
                  <p className="text-sm text-muted-foreground">Remove contacts with no activity</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Message Masking
              </CardTitle>
              <CardDescription>Protect sensitive information in messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-mask PII</Label>
                  <p className="text-sm text-muted-foreground">Automatically mask phone numbers, emails, etc.</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mask Credit Card Numbers</Label>
                  <p className="text-sm text-muted-foreground">Detect and mask payment information</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Regional Data Storage
              </CardTitle>
              <CardDescription>Control where your data is stored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Data Region</Label>
                <Select defaultValue="eu">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="ap">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Data will be stored in this region for compliance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Audit Export
              </CardTitle>
              <CardDescription>Export compliance and audit data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select defaultValue="30">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" className="w-full">Generate Audit Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
