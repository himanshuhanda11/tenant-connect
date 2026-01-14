import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  Save,
  Play,
  Eye,
  Upload,
  Settings,
  ChevronDown,
  MessageSquare,
  List,
  Image,
  FileText,
  Send,
  GitBranch,
  Clock,
  Timer,
  Shuffle,
  Calendar,
  Tag,
  Users,
  Ticket,
  Webhook,
  Bell,
  Filter,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link2,
  MoreVertical,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  AlignCenter,
  Crown,
  Smartphone,
  FolderOpen,
  Edit3,
  Keyboard,
  QrCode,
  Megaphone,
  Code,
  MousePointer,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Node categories for the palette
const nodeCategories = [
  {
    label: 'Message Types',
    icon: MessageSquare,
    nodes: [
      { type: 'text-buttons', label: 'Text + Buttons', icon: MessageSquare },
      { type: 'list-message', label: 'List Message', icon: List },
      { type: 'media', label: 'Media', icon: Image },
      { type: 'document', label: 'Document', icon: FileText },
      { type: 'template', label: 'Template', icon: Send },
    ],
  },
  {
    label: 'Logic',
    icon: GitBranch,
    nodes: [
      { type: 'condition', label: 'Condition (If/Else)', icon: GitBranch },
      { type: 'switch', label: 'Switch (Multi-branch)', icon: Shuffle },
      { type: 'delay', label: 'Delay', icon: Clock },
      { type: 'timeout', label: 'Timeout', icon: Timer },
      { type: 'random-split', label: 'A/B Split', icon: Shuffle },
      { type: 'business-hours', label: 'Business Hours', icon: Calendar },
    ],
  },
  {
    label: 'Actions',
    icon: Zap,
    nodes: [
      { type: 'set-attribute', label: 'Set Attribute', icon: Edit3 },
      { type: 'add-tag', label: 'Add/Remove Tag', icon: Tag },
      { type: 'assign-agent', label: 'Assign Agent', icon: Users },
      { type: 'create-lead', label: 'Create Lead', icon: Users },
      { type: 'create-ticket', label: 'Create Ticket', icon: Ticket },
      { type: 'webhook', label: 'Webhook/API', icon: Webhook },
      { type: 'notify-team', label: 'Notify Team', icon: Bell },
      { type: 'add-segment', label: 'Add to Segment', icon: Filter },
    ],
  },
  {
    label: 'Pro',
    icon: Crown,
    nodes: [
      { type: 'ai-response', label: 'AI Response', icon: Sparkles, pro: true },
      { type: 'multilang', label: 'Multi-language', icon: MessageSquare, pro: true },
      { type: 'sla-handover', label: 'SLA Handover', icon: Clock, pro: true },
    ],
  },
];

// Smart blocks
const smartBlocks = [
  { id: 'lead-qual', label: 'Lead Qualification', description: 'Qualify and score leads' },
  { id: 'appointment', label: 'Appointment Booking', description: 'Book appointments with calendar' },
  { id: 'support-triage', label: 'Support Triage', description: 'Route support tickets smartly' },
];

// Trigger types
const triggerTypes = [
  { type: 'keyword', label: 'Keyword', icon: Keyboard, description: 'When user sends specific keywords' },
  { type: 'regex', label: 'Regex', icon: Code, pro: true, description: 'Advanced pattern matching' },
  { type: 'qr', label: 'QR Campaign', icon: QrCode, description: 'When user scans a QR code' },
  { type: 'ad', label: 'Click-to-WhatsApp Ad', icon: Megaphone, description: 'From Meta ad clicks' },
  { type: 'api', label: 'API/Webhook', icon: Webhook, description: 'Trigger via API call' },
  { type: 'default', label: 'Default Fallback', icon: MessageSquare, description: 'When no other flow matches' },
  { type: 'manual', label: 'Manual Start', icon: MousePointer, description: 'Agent triggers from inbox' },
];

// Mock flow nodes for canvas
const mockCanvasNodes = [
  { id: 'start', type: 'start', label: 'Flow Start', x: 100, y: 100 },
  { id: 'msg1', type: 'text-buttons', label: 'Welcome Message', x: 100, y: 220 },
  { id: 'cond1', type: 'condition', label: 'Check Intent', x: 100, y: 340 },
  { id: 'msg2', type: 'text-buttons', label: 'Sales Response', x: 0, y: 460 },
  { id: 'msg3', type: 'text-buttons', label: 'Support Response', x: 200, y: 460 },
];

// Globe icon for multilang
const Globe = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FlowBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  
  const [flowName, setFlowName] = useState(isNew ? 'Untitled Flow' : 'Welcome Message');
  const [isActive, setIsActive] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>('msg1');
  const [rightPanelTab, setRightPanelTab] = useState('settings');
  const [zoom, setZoom] = useState(100);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Message Types']);

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/flows')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-auto min-w-[200px]"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
          <Select defaultValue="onboarding">
            <SelectTrigger className="w-[140px] h-8">
              <FolderOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className={cn('text-sm font-medium', isActive ? 'text-green-600' : 'text-muted-foreground')}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Test Flow
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Fallbacks
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            History
            <Badge variant="secondary" className="ml-1 text-[10px]">Pro</Badge>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm">
            Save Draft
          </Button>
          <Button size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 border-r bg-card flex flex-col">
          <div className="p-3 border-b">
            <Input placeholder="Search nodes..." className="h-8" />
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {nodeCategories.map((category) => (
                <div key={category.label} className="mb-2">
                  <button
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-sm font-medium"
                    onClick={() => toggleCategory(category.label)}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{category.label}</span>
                    {category.label === 'Pro' && (
                      <Badge variant="secondary" className="text-[10px]">Pro</Badge>
                    )}
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      expandedCategories.includes(category.label) && 'rotate-180'
                    )} />
                  </button>
                  {expandedCategories.includes(category.label) && (
                    <div className="ml-2 mt-1 space-y-1">
                      {category.nodes.map((node) => (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, node.type)}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg cursor-grab hover:bg-muted text-sm',
                            node.pro && 'opacity-60'
                          )}
                        >
                          <node.icon className="w-4 h-4 text-muted-foreground" />
                          <span>{node.label}</span>
                          {node.pro && <Crown className="w-3 h-3 text-amber-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <Separator className="my-3" />
              
              <div className="mb-2">
                <div className="flex items-center gap-2 p-2 text-sm font-medium text-muted-foreground">
                  <Layers className="w-4 h-4" />
                  Smart Blocks
                </div>
                <div className="space-y-1">
                  {smartBlocks.map((block) => (
                    <div
                      key={block.id}
                      draggable
                      className="flex items-center gap-2 p-2 rounded-lg cursor-grab hover:bg-muted text-sm border border-dashed border-primary/30 bg-primary/5"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{block.label}</p>
                        <p className="text-[10px] text-muted-foreground">{block.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden">
          {/* Zoom controls */}
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-card border rounded-lg shadow-sm p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, zoom - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(100)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <AlignCenter className="w-4 h-4" />
            </Button>
          </div>

          {/* Mini Map */}
          <div className="absolute bottom-4 right-4 w-40 h-28 bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="w-full h-full bg-muted/50 relative">
              <div className="absolute inset-4 border-2 border-primary/30 rounded" />
            </div>
          </div>

          {/* Canvas nodes (simplified visualization) */}
          <div 
            className="absolute inset-0 overflow-auto"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Connection lines */}
              <line x1="140" y1="140" x2="140" y2="220" stroke="hsl(var(--border))" strokeWidth="2" />
              <line x1="140" y1="280" x2="140" y2="340" stroke="hsl(var(--border))" strokeWidth="2" />
              <line x1="140" y1="400" x2="80" y2="460" stroke="hsl(var(--border))" strokeWidth="2" />
              <line x1="140" y1="400" x2="240" y2="460" stroke="hsl(var(--border))" strokeWidth="2" />
            </svg>
            
            {mockCanvasNodes.map((node) => (
              <div
                key={node.id}
                className={cn(
                  'absolute w-40 bg-card border-2 rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition-all',
                  selectedNode === node.id ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                  node.type === 'start' && 'bg-green-500/10 border-green-500',
                  node.type === 'condition' && 'bg-amber-500/10 border-amber-500/50'
                )}
                style={{ left: node.x, top: node.y }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center gap-2">
                  {node.type === 'start' ? (
                    <Play className="w-4 h-4 text-green-600" />
                  ) : node.type === 'condition' ? (
                    <GitBranch className="w-4 h-4 text-amber-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium truncate">{node.label}</span>
                </div>
                {node.type !== 'start' && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {node.type === 'condition' ? 'If/Else branch' : 'Click to configure'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Flow Chapters */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-card">Welcome</Badge>
            <Badge variant="outline" className="bg-card">Qualification</Badge>
            <Badge variant="outline" className="bg-card opacity-50">Handover</Badge>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              + Chapter
            </Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l bg-card flex flex-col">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b h-10">
              <TabsTrigger value="settings" className="flex-1 text-xs">Settings</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 text-xs">Preview</TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex-1 text-xs">
                Diagnostics
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-[10px]">2</Badge>
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1">
              <TabsContent value="settings" className="p-4 m-0 space-y-4">
                {selectedNode === 'start' ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Flow Triggers</h3>
                    <p className="text-xs text-muted-foreground">Configure how this flow starts</p>
                    
                    <div className="space-y-2">
                      {triggerTypes.map((trigger) => (
                        <div
                          key={trigger.type}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-primary/50',
                            trigger.pro && 'opacity-60'
                          )}
                        >
                          <trigger.icon className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{trigger.label}</p>
                            <p className="text-[10px] text-muted-foreground">{trigger.description}</p>
                          </div>
                          {trigger.pro && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedNode ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Node Settings</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Node Name</label>
                        <Input defaultValue="Welcome Message" className="mt-1" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Message Text</label>
                        <textarea 
                          className="w-full mt-1 min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm" 
                          defaultValue="Hello {{first_name}}! Welcome to our service. How can we help you today?"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Quick Reply Buttons</label>
                        <div className="space-y-2 mt-1">
                          <Input defaultValue="I need help with an order" />
                          <Input defaultValue="Talk to sales" />
                          <Input defaultValue="Other" />
                          <Button variant="outline" size="sm" className="w-full">+ Add Button</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Select a node to configure</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="p-4 m-0">
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[220px]">
                    {/* Phone mockup */}
                    <div className="aspect-[9/16] bg-[#075e54] rounded-3xl p-2 shadow-xl">
                      <div className="h-full bg-[#ece5dd] rounded-2xl overflow-hidden flex flex-col">
                        {/* WhatsApp header */}
                        <div className="bg-[#075e54] text-white px-3 py-2 flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <div className="w-8 h-8 rounded-full bg-white/20" />
                          <div className="flex-1">
                            <p className="text-xs font-medium">Your Business</p>
                            <p className="text-[10px] opacity-70">online</p>
                          </div>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 p-2 space-y-2 overflow-auto">
                          <div className="bg-white rounded-lg p-2 text-[10px] max-w-[80%] shadow-sm">
                            Hello! Welcome to our service. How can we help you today?
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <div className="bg-white rounded-full px-2 py-1 text-[9px] border border-[#075e54] text-[#075e54]">
                              Help with order
                            </div>
                            <div className="bg-white rounded-full px-2 py-1 text-[9px] border border-[#075e54] text-[#075e54]">
                              Talk to sales
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Live preview of your flow messages
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="diagnostics" className="p-4 m-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600">Missing Connection</p>
                      <p className="text-xs text-muted-foreground">Node "Support Response" has no outgoing connection</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Fix</Button>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-600">High Drop-off</p>
                      <p className="text-xs text-muted-foreground">"Welcome Message" has 35% drop-off rate</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">All templates approved</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">No loops detected</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Valid variable usage</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Fix All Automatically
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
