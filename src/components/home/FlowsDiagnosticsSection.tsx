import React, { useState } from 'react';
import { 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  GitBranch,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

const flowHealth = {
  score: 92,
  status: 'Healthy',
  issues: [
    { type: 'warning', message: 'Node 4 has 23% drop-off rate', fix: 'Add a reminder message' },
    { type: 'info', message: 'Consider A/B testing the welcome message', fix: 'Create variant' },
  ]
};

const versionHistory = [
  { version: 'v1.4', date: 'Today 2:30 PM', author: 'Sarah', status: 'live' },
  { version: 'v1.3', date: 'Yesterday', author: 'Mike', status: 'archived' },
  { version: 'v1.2', date: '3 days ago', author: 'Sarah', status: 'archived' },
];

const heatmapNodes = [
  { name: 'Welcome Message', views: 10000, dropoff: 5 },
  { name: 'Product Interest', views: 9500, dropoff: 12 },
  { name: 'Pricing Info', views: 8360, dropoff: 8 },
  { name: 'Book Demo', views: 7691, dropoff: 23 },
  { name: 'Confirmation', views: 5922, dropoff: 0 },
];

export default function FlowsDiagnosticsSection() {
  const [view, setView] = useState<'before' | 'after'>('after');

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-green-100 text-green-700 border-0">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Flow Diagnostics
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Flows That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Heal Themselves
            </span>
          </h2>
          <p className="text-lg text-slate-600">
            Health scores, version history, and heatmaps to optimize every automation
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Health Score Card */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-green-600">{flowHealth.score}</span>
                  <span className="text-slate-500 mb-1">/100</span>
                </div>
                <Badge className="bg-green-500 text-white border-0 mb-4">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {flowHealth.status}
                </Badge>
                
                <div className="space-y-3">
                  {flowHealth.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {issue.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-slate-700">{issue.message}</p>
                        <button className="text-green-600 hover:underline text-xs">
                          {issue.fix} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-slate-600" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versionHistory.map((v, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        v.status === 'live' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{v.version}</span>
                          {v.status === 'live' && (
                            <Badge className="bg-green-500 text-white border-0 text-xs">Live</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{v.date} by {v.author}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-600">
                        {v.status === 'live' ? 'View' : 'Restore'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Heatmap */}
            <Card className="border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Drop-off Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {heatmapNodes.map((node, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-700 truncate">{node.name}</span>
                        <span className={`font-medium ${
                          node.dropoff > 15 ? 'text-red-600' : 
                          node.dropoff > 10 ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {node.dropoff > 0 ? `-${node.dropoff}%` : '—'}
                        </span>
                      </div>
                      <Progress 
                        value={100 - node.dropoff} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Before/After Toggle */}
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Flow Optimization Impact</h3>
                <Tabs value={view} onValueChange={(v) => setView(v as 'before' | 'after')}>
                  <TabsList className="bg-slate-100">
                    <TabsTrigger value="before">Before</TabsTrigger>
                    <TabsTrigger value="after">After</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${view === 'after' ? 'text-green-500' : 'text-slate-400'}`} />
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {view === 'after' ? '42%' : '18%'}
                  </div>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <Clock className={`w-8 h-8 mx-auto mb-2 ${view === 'after' ? 'text-green-500' : 'text-slate-400'}`} />
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {view === 'after' ? '2.5 min' : '8 min'}
                  </div>
                  <p className="text-sm text-slate-600">Avg. Response Time</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <XCircle className={`w-8 h-8 mx-auto mb-2 ${view === 'after' ? 'text-green-500' : 'text-red-400'}`} />
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {view === 'after' ? '3%' : '28%'}
                  </div>
                  <p className="text-sm text-slate-600">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-10">
            <Button size="lg" asChild className="bg-slate-900 hover:bg-slate-800">
              <Link to="/features/automation">
                Explore Flow Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
