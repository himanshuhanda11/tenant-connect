import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Save,
  Play,
  Eye,
  Upload,
  Settings,
  ChevronDown,
  ChevronRight,
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
  Plus,
  Trash2,
  GripVertical,
  Circle,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowBuilder } from '@/hooks/useFlows';
import { toast } from 'sonner';

// Node type configurations
const nodeCategories = [
  {
    label: 'Messages',
    icon: MessageSquare,
    color: 'text-blue-500',
    nodes: [
      { type: 'text-buttons', label: 'Text + Buttons', icon: MessageSquare, description: 'Send text with quick reply buttons' },
      { type: 'list-message', label: 'List Message', icon: List, description: 'Send a list with selectable options' },
      { type: 'media', label: 'Media', icon: Image, description: 'Send image, video, or audio' },
      { type: 'document', label: 'Document', icon: FileText, description: 'Send a document file' },
      { type: 'template', label: 'Template', icon: Send, description: 'Send an approved template' },
    ],
  },
  {
    label: 'Logic',
    icon: GitBranch,
    color: 'text-amber-500',
    nodes: [
      { type: 'condition', label: 'Condition', icon: GitBranch, description: 'Branch based on conditions' },
      { type: 'switch', label: 'Switch', icon: Shuffle, description: 'Multi-branch routing' },
      { type: 'delay', label: 'Delay', icon: Clock, description: 'Wait before next step' },
      { type: 'timeout', label: 'Timeout', icon: Timer, description: 'Handle no response' },
      { type: 'random-split', label: 'A/B Split', icon: Shuffle, description: 'Random split for testing' },
      { type: 'business-hours', label: 'Business Hours', icon: Calendar, description: 'Route by time' },
    ],
  },
  {
    label: 'Actions',
    icon: Zap,
    color: 'text-green-500',
    nodes: [
      { type: 'set-attribute', label: 'Set Attribute', icon: Edit3, description: 'Update contact data' },
      { type: 'add-tag', label: 'Add/Remove Tag', icon: Tag, description: 'Manage contact tags' },
      { type: 'assign-agent', label: 'Assign Agent', icon: Users, description: 'Hand over to human' },
      { type: 'create-ticket', label: 'Create Ticket', icon: Ticket, description: 'Create support ticket' },
      { type: 'webhook', label: 'Webhook/API', icon: Webhook, description: 'Call external API' },
      { type: 'notify-team', label: 'Notify Team', icon: Bell, description: 'Send internal alert' },
      { type: 'add-segment', label: 'Add to Segment', icon: Filter, description: 'Add to segment' },
    ],
  },
  {
    label: 'Pro',
    icon: Crown,
    color: 'text-purple-500',
    nodes: [
      { type: 'ai-response', label: 'AI Response', icon: Sparkles, pro: true, description: 'Generate AI reply' },
      { type: 'ai-classifier', label: 'AI Classifier', icon: Sparkles, pro: true, description: 'Classify intent with AI' },
      { type: 'language-router', label: 'Language Router', icon: MessageSquare, pro: true, description: 'Route by language' },
      { type: 'sla-timer', label: 'SLA Timer', icon: Timer, pro: true, description: 'Escalation rules' },
    ],
  },
];

// Trigger configurations
const triggerTypes = [
  { type: 'keyword', label: 'Keyword', icon: Keyboard, description: 'Trigger on keyword match' },
  { type: 'regex', label: 'Regex', icon: Code, pro: true, description: 'Advanced pattern matching' },
  { type: 'qr', label: 'QR Campaign', icon: QrCode, description: 'Trigger from QR scan' },
  { type: 'meta_ad', label: 'Click-to-WhatsApp', icon: Megaphone, description: 'From Meta ad clicks' },
  { type: 'api', label: 'API/Webhook', icon: Webhook, description: 'External API trigger' },
  { type: 'manual', label: 'Manual Start', icon: MousePointer, description: 'Agent triggers from inbox' },
  { type: 'fallback', label: 'Fallback', icon: MessageSquare, description: 'When no flow matches' },
];

// Node colors by type
const nodeColors: Record<string, { bg: string; border: string; icon: string }> = {
  start: { bg: 'bg-green-500/10', border: 'border-green-500', icon: 'text-green-600' },
  'text-buttons': { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'text-blue-600' },
  'list-message': { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'text-blue-600' },
  media: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'text-blue-600' },
  document: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'text-blue-600' },
  template: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'text-blue-600' },
  condition: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', icon: 'text-amber-600' },
  switch: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', icon: 'text-amber-600' },
  delay: { bg: 'bg-slate-500/10', border: 'border-slate-500/50', icon: 'text-slate-600' },
  timeout: { bg: 'bg-slate-500/10', border: 'border-slate-500/50', icon: 'text-slate-600' },
  'random-split': { bg: 'bg-amber-500/10', border: 'border-amber-500/50', icon: 'text-amber-600' },
  'business-hours': { bg: 'bg-slate-500/10', border: 'border-slate-500/50', icon: 'text-slate-600' },
  'set-attribute': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  'add-tag': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  'assign-agent': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  'create-ticket': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  webhook: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', icon: 'text-orange-600' },
  'notify-team': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  'add-segment': { bg: 'bg-green-500/10', border: 'border-green-500/50', icon: 'text-green-600' },
  'ai-response': { bg: 'bg-purple-500/10', border: 'border-purple-500/50', icon: 'text-purple-600' },
  'ai-classifier': { bg: 'bg-purple-500/10', border: 'border-purple-500/50', icon: 'text-purple-600' },
  'language-router': { bg: 'bg-purple-500/10', border: 'border-purple-500/50', icon: 'text-purple-600' },
  'sla-timer': { bg: 'bg-purple-500/10', border: 'border-purple-500/50', icon: 'text-purple-600' },
};

const getNodeIcon = (type: string) => {
  for (const cat of nodeCategories) {
    const node = cat.nodes.find(n => n.type === type);
    if (node) return node.icon;
  }
  return MessageSquare;
};

const FlowBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  
  const { 
    flow, nodes, edges, triggers, diagnostics, loading, saving,
    addNode, updateNode, deleteNode, addEdge, deleteEdge, saveFlow, publishFlow,
    addTrigger, updateTrigger, deleteTrigger, toggleTrigger
  } = useFlowBuilder(id);

  // Trigger configuration state
  const [editingTriggerId, setEditingTriggerId] = useState<string | null>(null);
  const [triggerKeyword, setTriggerKeyword] = useState('');
  
  const [flowName, setFlowName] = useState('');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState('settings');
  const [zoom, setZoom] = useState(100);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Messages']);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [dragNodeType, setDragNodeType] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  
  // Node dragging state
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (flow) {
      setFlowName(flow.name);
    }
  }, [flow]);

  // Ensure dragging always ends even if mouseup happens outside the canvas
  useEffect(() => {
    if (!draggingNode) return;
    const handleUp = () => setDraggingNode(null);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [draggingNode]);

  const selectedNode = nodes.find(n => n.node_key === selectedNodeKey);

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // New node drag from palette
  const handlePaletteDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
    setDragNodeType(nodeType);
    setIsDraggingNew(true);
  };

  const handlePaletteDragEnd = () => {
    setIsDraggingNew(false);
    setDragNodeType(null);
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType || !canvasContentRef.current) return;

    const rect = canvasContentRef.current.getBoundingClientRect();
    const x = Math.max(0, (e.clientX - rect.left) / (zoom / 100));
    const y = Math.max(0, (e.clientY - rect.top) / (zoom / 100));

    await addNode(nodeType, { x, y });
    setIsDraggingNew(false);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Existing node dragging on canvas
  const handleNodeMouseDown = (e: React.MouseEvent, nodeKey: string) => {
    if (e.button !== 0) return; // Only left click

    // Don't start dragging when interacting with controls inside the node
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, input, textarea, select, [data-no-drag]')) return;

    e.stopPropagation();

    const node = nodes.find(n => n.node_key === nodeKey);
    if (!node || !canvasContentRef.current) return;

    const rect = canvasContentRef.current.getBoundingClientRect();
    const scale = zoom / 100;

    // Offset is measured in *canvas coordinates* (pre-scale)
    const pointerX = (e.clientX - rect.left) / scale;
    const pointerY = (e.clientY - rect.top) / scale;

    setDraggingNode(nodeKey);
    setDragOffset({
      x: pointerX - node.position_x,
      y: pointerY - node.position_y,
    });
    setSelectedNodeKey(nodeKey);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingNode || !canvasContentRef.current) return;

    const rect = canvasContentRef.current.getBoundingClientRect();
    const scale = zoom / 100;

    const pointerX = (e.clientX - rect.left) / scale;
    const pointerY = (e.clientY - rect.top) / scale;

    const newX = Math.max(0, pointerX - dragOffset.x);
    const newY = Math.max(0, pointerY - dragOffset.y);

    updateNode(draggingNode, { position_x: newX, position_y: newY });
  }, [draggingNode, dragOffset.x, dragOffset.y, zoom, updateNode]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  const handleNodeClick = (nodeKey: string) => {
    if (!draggingNode) {
      setSelectedNodeKey(nodeKey);
      setRightPanelTab('settings');
    }
  };

  const handleAddConnection = async (sourceKey: string) => {
    if (connecting) {
      if (connecting !== sourceKey) {
        await addEdge(connecting, sourceKey);
      }
      setConnecting(null);
    } else {
      setConnecting(sourceKey);
    }
  };

  const handleSave = async () => {
    if (flowName !== flow?.name) {
      await saveFlow({ name: flowName });
    } else {
      toast.success('Flow saved');
    }
  };

  const handlePublish = async () => {
    await publishFlow();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading flow builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Top Bar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/flows')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-xl">{flow?.emoji || '🔄'}</span>
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-auto min-w-[200px]"
              placeholder="Flow name"
            />
          </div>
          <Badge variant="outline" className={cn(
            'ml-2',
            flow?.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted'
          )}>
            {flow?.status || 'draft'}
          </Badge>
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
            <History className="w-4 h-4" />
            History
            <Badge variant="secondary" className="ml-1 text-[10px]">Pro</Badge>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" onClick={handlePublish}>
            <Upload className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-72 border-r bg-card flex flex-col shrink-0">
          <div className="p-3 border-b">
            <Input placeholder="Search nodes..." className="h-9" />
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {nodeCategories.map((category) => (
                <div key={category.label} className="mb-1">
                  <button
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors"
                    onClick={() => toggleCategory(category.label)}
                  >
                    <category.icon className={cn('w-4 h-4', category.color)} />
                    <span className="flex-1 text-left">{category.label}</span>
                    {category.label === 'Pro' && (
                      <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600">Pro</Badge>
                    )}
                    <ChevronRight className={cn(
                      'w-4 h-4 transition-transform text-muted-foreground',
                      expandedCategories.includes(category.label) && 'rotate-90'
                    )} />
                  </button>
                    {expandedCategories.includes(category.label) && (
                    <div className="ml-2 mt-1 space-y-1 pl-4 border-l border-border">
                      {category.nodes.map((node) => (
                        <Tooltip key={node.type} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div
                              draggable={!node.pro}
                              onDragStart={(e) => handlePaletteDragStart(e, node.type)}
                              onDragEnd={handlePaletteDragEnd}
                              className={cn(
                                'flex items-center gap-2.5 p-2.5 rounded-lg text-sm transition-all select-none',
                                node.pro ? 'cursor-not-allowed opacity-50' : 'cursor-grab hover:bg-muted active:cursor-grabbing active:scale-95 active:bg-primary/10'
                              )}
                            >
                              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', 
                                nodeColors[node.type]?.bg || 'bg-muted')}>
                                <node.icon className={cn('w-4 h-4', nodeColors[node.type]?.icon || 'text-muted-foreground')} />
                              </div>
                              <span className="flex-1">{node.label}</span>
                              {node.pro && <Crown className="w-3.5 h-3.5 text-purple-500" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[200px]">
                            <p>{node.description}</p>
                            {node.pro && <p className="text-amber-500 mt-1">Upgrade to Pro to unlock</p>}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className={cn(
            'flex-1 relative overflow-auto',
            isDraggingNew && 'bg-primary/5',
            draggingNode && 'cursor-grabbing'
          )}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Zoom controls */}
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-card border rounded-xl shadow-lg p-1.5 z-10">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(25, zoom - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center font-medium">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(100)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Connection indicator */}
          {connecting && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-10 animate-pulse">
              Click on target node to connect
            </div>
          )}

          {/* Canvas content with zoom */}
          <div 
            ref={canvasContentRef}
            className="min-h-full min-w-full p-8 relative"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', minWidth: '2000px', minHeight: '1500px' }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '1500px' }}>
              {edges.map((edge) => {
                const sourceNode = nodes.find(n => n.node_key === edge.source_node_key);
                const targetNode = nodes.find(n => n.node_key === edge.target_node_key);
                if (!sourceNode || !targetNode) return null;
                
                const x1 = sourceNode.position_x + 100;
                const y1 = sourceNode.position_y + 60;
                const x2 = targetNode.position_x + 100;
                const y2 = targetNode.position_y;
                
                const midY = (y1 + y2) / 2;
                
                return (
                  <g key={edge.edge_key}>
                    <path
                      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={connecting ? "5,5" : "none"}
                    />
                    <circle cx={x2} cy={y2} r="4" fill="hsl(var(--primary))" />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const NodeIcon = getNodeIcon(node.node_type);
              const colors = nodeColors[node.node_type] || { bg: 'bg-muted', border: 'border-border', icon: 'text-muted-foreground' };
              
              return (
                <div
                  key={node.node_key}
                  className={cn(
                    'absolute w-[200px] bg-card rounded-xl border-2 shadow-lg select-none transition-shadow',
                    draggingNode === node.node_key ? 'cursor-grabbing shadow-2xl z-50 scale-105' : 'cursor-grab hover:shadow-xl',
                    colors.border,
                    selectedNodeKey === node.node_key && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    connecting === node.node_key && 'ring-2 ring-green-500 animate-pulse',
                    connecting && connecting !== node.node_key && 'ring-2 ring-blue-400/50 hover:ring-blue-500'
                  )}
                  style={{ 
                    left: node.position_x, 
                    top: node.position_y,
                    transition: draggingNode === node.node_key ? 'none' : 'box-shadow 0.2s, transform 0.1s'
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.node_key)}
                  onClick={() => handleNodeClick(node.node_key)}
                >
                  {/* Drag handle indicator */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-40">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                  </div>
                  
                  {/* Node header */}
                  <div className={cn('flex items-center gap-2 px-3 py-2.5 pt-3 rounded-t-xl', colors.bg)}>
                    <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center shadow-sm">
                      <NodeIcon className={cn('w-4 h-4', colors.icon)} />
                    </div>
                    <span className="font-medium text-sm flex-1 truncate">{node.label}</span>
                  </div>
                  
                  {/* Node body */}
                  <div className="px-3 py-2.5 text-xs text-muted-foreground">
                    {node.node_type === 'start' ? (
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Configure triggers →
                      </span>
                    ) : node.config?.message ? (
                      <span className="line-clamp-2">{node.config.message}</span>
                    ) : (
                      <span className="italic opacity-70">Click to configure</span>
                    )}
                  </div>

                  {/* Input connection point (top) */}
                  {node.node_type !== 'start' && (
                    <button 
                      className={cn(
                        "absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 shadow-md transition-all",
                        connecting ? 'bg-blue-500 border-blue-400 scale-125 animate-pulse' : 'bg-card border-primary hover:scale-125'
                      )}
                      onClick={(e) => { e.stopPropagation(); handleAddConnection(node.node_key); }}
                    >
                      {connecting && <ArrowDown className="w-3 h-3 mx-auto text-white" />}
                    </button>
                  )}
                  
                  {/* Output connection point (bottom) */}
                  <button 
                    className={cn(
                      "absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-lg transition-all flex items-center justify-center",
                      connecting === node.node_key ? 'bg-green-500 scale-125' : 'bg-primary hover:scale-125 hover:bg-primary/90'
                    )}
                    onClick={(e) => { e.stopPropagation(); handleAddConnection(node.node_key); }}
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>

                  {/* Delete button */}
                  {node.node_type !== 'start' && selectedNodeKey === node.node_key && (
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:scale-110 transition-transform z-10"
                      onClick={(e) => { e.stopPropagation(); deleteNode(node.node_key); setSelectedNodeKey(null); }}
                    >
                      <Trash2 className="w-3 h-3 mx-auto" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Drag nodes here to start building</h3>
                  <p className="text-sm">Choose nodes from the left panel</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l bg-card flex flex-col shrink-0">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b h-11 bg-transparent p-0">
              <TabsTrigger value="settings" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
                Settings
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
                Preview
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs relative">
                Diagnostics
                {diagnostics.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px]">
                    {diagnostics.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1">
              <TabsContent value="settings" className="p-4 m-0 space-y-4">
                {selectedNode?.node_type === 'start' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Flow Triggers</h3>
                      <p className="text-xs text-muted-foreground">Configure how this flow starts</p>
                    </div>
                    
                    {/* Active Triggers */}
                    {triggers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Active Triggers</Label>
                        {triggers.map((trigger) => {
                          const triggerInfo = triggerTypes.find(t => t.type === trigger.trigger_type);
                          const TriggerIcon = triggerInfo?.icon || Keyboard;
                          return (
                            <div
                              key={trigger.id}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                                editingTriggerId === trigger.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TriggerIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{triggerInfo?.label || trigger.trigger_type}</p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {(trigger.config as any)?.keyword || (trigger.config as any)?.pattern || 'Click to configure'}
                                </p>
                              </div>
                              <Switch 
                                checked={trigger.is_enabled} 
                                onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                                data-no-drag
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 shrink-0"
                                onClick={() => setEditingTriggerId(editingTriggerId === trigger.id ? null : trigger.id)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive shrink-0"
                                onClick={() => deleteTrigger(trigger.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Trigger Configuration Panel */}
                    {editingTriggerId && (() => {
                      const trigger = triggers.find(t => t.id === editingTriggerId);
                      if (!trigger) return null;
                      return (
                        <div className="p-3 rounded-xl border bg-muted/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">Configure Trigger</Label>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => setEditingTriggerId(null)}
                            >
                              Done
                            </Button>
                          </div>
                          
                          {trigger.trigger_type === 'keyword' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Keyword(s)</Label>
                              <Input 
                                placeholder="e.g., hello, hi, start"
                                defaultValue={(trigger.config as any)?.keyword || ''}
                                onChange={(e) => updateTrigger(trigger.id, { 
                                  config: { ...trigger.config, keyword: e.target.value } 
                                })}
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Separate multiple keywords with commas
                              </p>
                            </div>
                          )}
                          
                          {trigger.trigger_type === 'regex' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Regex Pattern</Label>
                              <Input 
                                placeholder="e.g., ^order\\s+\\d+"
                                defaultValue={(trigger.config as any)?.pattern || ''}
                                onChange={(e) => updateTrigger(trigger.id, { 
                                  config: { ...trigger.config, pattern: e.target.value } 
                                })}
                              />
                            </div>
                          )}
                          
                          {trigger.trigger_type === 'qr' && (
                            <div className="space-y-2">
                              <Label className="text-xs">QR Code Campaign ID</Label>
                              <Input 
                                placeholder="campaign-123"
                                defaultValue={(trigger.config as any)?.campaign_id || ''}
                                onChange={(e) => updateTrigger(trigger.id, { 
                                  config: { ...trigger.config, campaign_id: e.target.value } 
                                })}
                              />
                            </div>
                          )}

                          {trigger.trigger_type === 'meta_ad' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Meta Ad Campaign ID</Label>
                              <Input 
                                placeholder="ad-123"
                                defaultValue={(trigger.config as any)?.ad_id || ''}
                                onChange={(e) => updateTrigger(trigger.id, { 
                                  config: { ...trigger.config, ad_id: e.target.value } 
                                })}
                              />
                            </div>
                          )}

                          {trigger.trigger_type === 'api' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Webhook Secret (optional)</Label>
                              <Input 
                                placeholder="your-secret-key"
                                defaultValue={(trigger.config as any)?.secret || ''}
                                onChange={(e) => updateTrigger(trigger.id, { 
                                  config: { ...trigger.config, secret: e.target.value } 
                                })}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <Separator />
                    
                    {/* Add New Trigger */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Add New Trigger</Label>
                      {triggerTypes.map((trigger) => (
                        <button
                          key={trigger.type}
                          disabled={trigger.pro}
                          onClick={() => {
                            if (!trigger.pro) {
                              addTrigger(trigger.type, {});
                            }
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all text-left',
                            trigger.pro 
                              ? 'cursor-not-allowed opacity-50 border-border' 
                              : 'cursor-pointer hover:border-primary hover:bg-primary/5 border-border'
                          )}
                        >
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <trigger.icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{trigger.label}</p>
                            <p className="text-[11px] text-muted-foreground">{trigger.description}</p>
                          </div>
                          {trigger.pro ? (
                            <Crown className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Node Settings</h3>
                      <p className="text-xs text-muted-foreground capitalize">{selectedNode.node_type.replace(/-/g, ' ')}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Node Name</Label>
                        <Input 
                          value={selectedNode.label || ''} 
                          onChange={(e) => updateNode(selectedNode.node_key, { label: e.target.value })}
                        />
                      </div>
                      
                      {(selectedNode.node_type === 'text-buttons' || selectedNode.node_type === 'template') && (
                        <div className="space-y-2">
                          <Label className="text-xs">Message Text</Label>
                          <Textarea 
                            className="min-h-[100px] text-sm"
                            placeholder="Enter your message..."
                            value={selectedNode.config?.message || ''}
                            onChange={(e) => updateNode(selectedNode.node_key, { 
                              config: { ...selectedNode.config, message: e.target.value } 
                            })}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Use {'{{first_name}}'} for personalization
                          </p>
                        </div>
                      )}

                      {selectedNode.node_type === 'delay' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Duration</Label>
                            <Input 
                              type="number" 
                              defaultValue={selectedNode.config?.duration || 5}
                              onChange={(e) => updateNode(selectedNode.node_key, {
                                config: { ...selectedNode.config, duration: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Unit</Label>
                            <Select defaultValue={selectedNode.config?.unit || 'seconds'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seconds">Seconds</SelectItem>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {selectedNode.node_type === 'assign-agent' && (
                        <div className="space-y-2">
                          <Label className="text-xs">Assignment Strategy</Label>
                          <Select defaultValue={selectedNode.config?.strategy || 'round_robin'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="round_robin">Round Robin</SelectItem>
                              <SelectItem value="least_busy">Least Busy</SelectItem>
                              <SelectItem value="specific">Specific Agent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Select a node to configure</p>
                    <p className="text-xs mt-1">Or drag a node to the canvas</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="p-4 m-0">
                <div className="flex flex-col items-center">
                  {/* Phone mockup */}
                  <div className="w-full max-w-[240px]">
                    <div className="aspect-[9/16] bg-gradient-to-b from-[#128C7E] to-[#075E54] rounded-[2rem] p-2 shadow-2xl">
                      <div className="h-full bg-[#ECE5DD] rounded-[1.5rem] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                            🏢
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium">Your Business</p>
                            <p className="text-[10px] opacity-70">online</p>
                          </div>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 p-3 space-y-2 overflow-auto">
                          {nodes.filter(n => n.node_type !== 'start').slice(0, 3).map((node, i) => (
                            <div key={i} className="bg-white rounded-lg p-2.5 text-[11px] max-w-[85%] shadow-sm">
                              {node.config?.message || node.label || 'Message content...'}
                            </div>
                          ))}
                          {nodes.length <= 1 && (
                            <div className="bg-white rounded-lg p-2.5 text-[11px] max-w-[85%] shadow-sm text-muted-foreground italic">
                              Add message nodes to see preview
                            </div>
                          )}
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
                {diagnostics.length > 0 ? (
                  <div className="space-y-3">
                    {diagnostics.map((diag) => (
                      <div 
                        key={diag.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border',
                          diag.severity === 'error' ? 'bg-red-500/10 border-red-500/20' :
                          diag.severity === 'warn' ? 'bg-amber-500/10 border-amber-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        )}
                      >
                        {diag.severity === 'error' ? (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        ) : diag.severity === 'warn' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            diag.severity === 'error' ? 'text-red-600' : 
                            diag.severity === 'warn' ? 'text-amber-600' : 'text-blue-600'
                          )}>
                            {diag.code.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{diag.message}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">Fix</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">All checks passed!</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>All nodes connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>No loops detected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Valid configuration</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button variant="outline" className="w-full gap-2 mt-4">
                  <Sparkles className="w-4 h-4" />
                  Run Full Diagnostics
                </Button>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
