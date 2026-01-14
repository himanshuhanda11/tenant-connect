import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Image,
  Info,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Tag,
  Target,
  Upload,
  Users,
  X,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CampaignGoal, 
  CampaignType, 
  CampaignWizardState,
  CAMPAIGN_GOAL_CONFIG,
  CAMPAIGN_TYPE_CONFIG
} from '@/types/campaign';

const STEPS = [
  { id: 1, title: 'Basics', icon: Settings },
  { id: 2, title: 'Message', icon: MessageSquare },
  { id: 3, title: 'Audience', icon: Users },
  { id: 4, title: 'Delivery', icon: Send },
  { id: 5, title: 'Review', icon: CheckCircle },
];

const MOCK_PHONE_NUMBERS = [
  { id: 'p1', display: '+971 50 123 4567', name: 'Main Business' },
  { id: 'p2', display: '+971 50 987 6543', name: 'Support Line' },
];

const MOCK_TEMPLATES = [
  { id: 't1', name: 'summer_sale_promo', category: 'MARKETING', status: 'APPROVED', language: 'en' },
  { id: 't2', name: 'order_confirmation', category: 'UTILITY', status: 'APPROVED', language: 'en' },
  { id: 't3', name: 'welcome_message', category: 'MARKETING', status: 'APPROVED', language: 'en' },
  { id: 't4', name: 'payment_reminder', category: 'UTILITY', status: 'APPROVED', language: 'en' },
];

const MOCK_SEGMENTS = [
  { id: 's1', name: 'VIP Customers', count: 450 },
  { id: 's2', name: 'New Leads (7 days)', count: 230 },
  { id: 's3', name: 'Inactive 30 Days', count: 890 },
  { id: 's4', name: 'CTWA Leads', count: 156 },
];

const MOCK_TAGS = [
  { id: 'tag1', name: 'VIP', color: '#10b981' },
  { id: 'tag2', name: 'Hot Lead', color: '#f59e0b' },
  { id: 'tag3', name: 'Opted-out', color: '#ef4444' },
  { id: 'tag4', name: 'Customer', color: '#3b82f6' },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [wizard, setWizard] = useState<CampaignWizardState>({
    step: 1,
    basics: {
      name: '',
      goal: '',
      phone_number_id: '',
      campaign_type: 'broadcast',
    },
    message: {
      template_id: '',
      template_name: '',
      template_category: '',
      variables: {},
    },
    audience: {
      source: 'segments',
      include_segments: [],
      exclude_segments: [],
      include_tags: [],
      exclude_tags: [],
      exclude_recent_days: 0,
      estimated_count: 0,
    },
    delivery: {
      send_type: 'now',
      timezone: 'Asia/Dubai',
      business_hours_only: false,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      messages_per_minute: 30,
      frequency_cap_days: 0,
    },
    abTest: {
      enabled: false,
      split_ratio: 50,
      winner_metric: 'reply_rate',
    },
  });

  const updateBasics = (field: string, value: string) => {
    setWizard(prev => ({
      ...prev,
      basics: { ...prev.basics, [field]: value }
    }));
  };

  const updateMessage = (field: string, value: string) => {
    setWizard(prev => ({
      ...prev,
      message: { ...prev.message, [field]: value }
    }));
  };

  const updateAudience = (field: string, value: unknown) => {
    setWizard(prev => ({
      ...prev,
      audience: { ...prev.audience, [field]: value }
    }));
  };

  const updateDelivery = (field: string, value: unknown) => {
    setWizard(prev => ({
      ...prev,
      delivery: { ...prev.delivery, [field]: value }
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizard.basics.name && wizard.basics.goal && wizard.basics.phone_number_id;
      case 2:
        return wizard.message.template_id;
      case 3:
        return wizard.audience.include_segments.length > 0 || wizard.audience.include_tags.length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (sendNow: boolean) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    navigate('/campaigns');
  };

  const toggleSegment = (segmentId: string, type: 'include' | 'exclude') => {
    const field = type === 'include' ? 'include_segments' : 'exclude_segments';
    const current = wizard.audience[field];
    if (current.includes(segmentId)) {
      updateAudience(field, current.filter(id => id !== segmentId));
    } else {
      updateAudience(field, [...current, segmentId]);
    }
  };

  const toggleTag = (tagId: string, type: 'include' | 'exclude') => {
    const field = type === 'include' ? 'include_tags' : 'exclude_tags';
    const current = wizard.audience[field];
    if (current.includes(tagId)) {
      updateAudience(field, current.filter(id => id !== tagId));
    } else {
      updateAudience(field, [...current, tagId]);
    }
  };

  const estimatedAudience = () => {
    let count = 0;
    wizard.audience.include_segments.forEach(id => {
      const seg = MOCK_SEGMENTS.find(s => s.id === id);
      if (seg) count += seg.count;
    });
    return count > 0 ? count : 0;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Campaign</h1>
              <p className="text-muted-foreground">Step {currentStep} of 5</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/campaigns')}>
            Save Draft
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer
                  ${currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : currentStep > step.id 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden md:inline text-sm font-medium">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Campaign Basics</CardTitle>
                  <CardDescription>Set up the foundation for your campaign</CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Summer Sale 2025"
                      value={wizard.basics.name}
                      onChange={(e) => updateBasics('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Goal *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(Object.entries(CAMPAIGN_GOAL_CONFIG) as [CampaignGoal, typeof CAMPAIGN_GOAL_CONFIG[CampaignGoal]][]).map(([key, config]) => (
                        <div
                          key={key}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50
                            ${wizard.basics.goal === key ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                          onClick={() => updateBasics('goal', key)}
                        >
                          <div className="text-2xl mb-2">{config.icon}</div>
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp Number *</Label>
                    <Select
                      value={wizard.basics.phone_number_id}
                      onValueChange={(v) => updateBasics('phone_number_id', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select phone number" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PHONE_NUMBERS.map(phone => (
                          <SelectItem key={phone.id} value={phone.id}>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              {phone.display} - {phone.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Marketing templates require opt-in consent. AIREATRO automatically enforces opt-out and compliance rules.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Step 2: Message */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Message Content</CardTitle>
                  <CardDescription>Choose a template and customize your message</CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template *</Label>
                    <div className="space-y-2">
                      {MOCK_TEMPLATES.filter(t => t.status === 'APPROVED').map(template => (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 flex items-center justify-between
                            ${wizard.message.template_id === template.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                          onClick={() => {
                            updateMessage('template_id', template.id);
                            updateMessage('template_name', template.name);
                            updateMessage('template_category', template.category);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                              ${template.category === 'MARKETING' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                              <FileText className={`h-5 w-5 ${template.category === 'MARKETING' ? 'text-purple-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  Approved
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {wizard.message.template_id === template.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {wizard.message.template_id && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <Label>Variable Mapping</Label>
                        <p className="text-sm text-muted-foreground">
                          Map template variables to contact fields or enter static values
                        </p>
                        
                        <div className="grid gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium text-muted-foreground">{"{{1}}"}</div>
                            <Select defaultValue="name">
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Contact Name</SelectItem>
                                <SelectItem value="first_name">First Name</SelectItem>
                                <SelectItem value="phone">Phone Number</SelectItem>
                                <SelectItem value="custom">Custom Value...</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium text-muted-foreground">{"{{2}}"}</div>
                            <Input placeholder="Enter value or select field" defaultValue="20% OFF" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Preview (Sample Contact)</p>
                        <div className="bg-white rounded-lg p-3 border max-w-xs">
                          <p className="text-sm">
                            Hi <span className="text-primary font-medium">Ahmed</span>! 🎉
                          </p>
                          <p className="text-sm mt-1">
                            Don't miss our exclusive <span className="text-primary font-medium">20% OFF</span> sale!
                          </p>
                          <p className="text-sm mt-1">Shop now and save big!</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Audience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Target Audience</CardTitle>
                  <CardDescription>Select who will receive this campaign</CardDescription>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Include */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                      <Label className="text-base">Include</Label>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Segments</p>
                      {MOCK_SEGMENTS.map(segment => (
                        <div
                          key={segment.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between
                            ${wizard.audience.include_segments.includes(segment.id) ? 'border-green-500 bg-green-50' : 'hover:border-green-300'}`}
                          onClick={() => toggleSegment(segment.id, 'include')}
                        >
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{segment.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {segment.count.toLocaleString()}
                            </Badge>
                            {wizard.audience.include_segments.includes(segment.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_TAGS.filter(t => t.name !== 'Opted-out').map(tag => (
                          <Badge
                            key={tag.id}
                            variant={wizard.audience.include_tags.includes(tag.id) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag.id, 'include')}
                          >
                            <div 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: tag.color }} 
                            />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Exclude */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                      <Label className="text-base">Exclude</Label>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Safety Exclusions</p>
                      <div className="space-y-2">
                        <div className="p-3 border rounded-lg bg-red-50 border-red-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            <span className="text-sm">Opted-out contacts</span>
                          </div>
                          <Badge className="bg-red-100 text-red-700">Auto-excluded</Badge>
                        </div>
                        <div className="p-3 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Messaged in last 24h</span>
                          </div>
                          <Switch 
                            checked={wizard.audience.exclude_recent_days > 0}
                            onCheckedChange={(checked) => updateAudience('exclude_recent_days', checked ? 1 : 0)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Exclude Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_TAGS.map(tag => (
                          <Badge
                            key={tag.id}
                            variant={wizard.audience.exclude_tags.includes(tag.id) ? 'destructive' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag.id, 'exclude')}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audience Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Audience</p>
                          <p className="text-2xl font-bold">{estimatedAudience().toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-green-600">+{wizard.audience.include_segments.length} segments included</p>
                        <p className="text-red-600">-{wizard.audience.exclude_tags.length} tags excluded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Delivery */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Delivery Settings</CardTitle>
                  <CardDescription>Configure when and how your campaign is sent</CardDescription>
                </div>

                <div className="space-y-6">
                  {/* Send Type */}
                  <div className="space-y-3">
                    <Label>When to Send</Label>
                    <RadioGroup 
                      value={wizard.delivery.send_type} 
                      onValueChange={(v) => updateDelivery('send_type', v)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer
                        ${wizard.delivery.send_type === 'now' ? 'border-primary bg-primary/5' : ''}`}>
                        <RadioGroupItem value="now" id="now" />
                        <Label htmlFor="now" className="cursor-pointer flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Send Now
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer
                        ${wizard.delivery.send_type === 'scheduled' ? 'border-primary bg-primary/5' : ''}`}>
                        <RadioGroupItem value="scheduled" id="scheduled" />
                        <Label htmlFor="scheduled" className="cursor-pointer flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Schedule Later
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {wizard.delivery.send_type === 'scheduled' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date & Time</Label>
                        <Input type="datetime-local" />
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select value={wizard.delivery.timezone} onValueChange={(v) => updateDelivery('timezone', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                            <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Throttling */}
                  <div className="space-y-4">
                    <Label className="text-base">Throttling & Rate Limits</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Messages per minute</Label>
                        <Select 
                          value={wizard.delivery.messages_per_minute.toString()} 
                          onValueChange={(v) => updateDelivery('messages_per_minute', parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 / min (Slow)</SelectItem>
                            <SelectItem value="30">30 / min (Normal)</SelectItem>
                            <SelectItem value="60">60 / min (Fast)</SelectItem>
                            <SelectItem value="100">100 / min (Maximum)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Frequency Cap</Label>
                        <Select 
                          value={wizard.delivery.frequency_cap_days.toString()} 
                          onValueChange={(v) => updateDelivery('frequency_cap_days', parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No limit</SelectItem>
                            <SelectItem value="1">1 campaign/day per contact</SelectItem>
                            <SelectItem value="3">1 campaign/3 days</SelectItem>
                            <SelectItem value="7">1 campaign/week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Business Hours */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Business Hours Only</Label>
                        <p className="text-sm text-muted-foreground">Pause sending during off-hours</p>
                      </div>
                      <Switch 
                        checked={wizard.delivery.business_hours_only}
                        onCheckedChange={(checked) => updateDelivery('business_hours_only', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Quiet Hours</Label>
                        <p className="text-sm text-muted-foreground">Don't send late at night</p>
                      </div>
                      <Switch 
                        checked={wizard.delivery.quiet_hours_enabled}
                        onCheckedChange={(checked) => updateDelivery('quiet_hours_enabled', checked)}
                      />
                    </div>

                    {wizard.delivery.quiet_hours_enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Start</Label>
                          <Input 
                            type="time" 
                            value={wizard.delivery.quiet_hours_start}
                            onChange={(e) => updateDelivery('quiet_hours_start', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">End</Label>
                          <Input 
                            type="time" 
                            value={wizard.delivery.quiet_hours_end}
                            onChange={(e) => updateDelivery('quiet_hours_end', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Review & Launch</CardTitle>
                  <CardDescription>Verify everything before sending</CardDescription>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Campaign Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{wizard.basics.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="font-medium capitalize">{wizard.basics.goal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">
                          {MOCK_PHONE_NUMBERS.find(p => p.id === wizard.basics.phone_number_id)?.display || '—'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template</span>
                        <span className="font-medium">{wizard.message.template_name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline" className="text-xs">{wizard.message.template_category || '—'}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Audience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Recipients</span>
                        <span className="font-medium text-primary">{estimatedAudience().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Segments</span>
                        <span className="font-medium">{wizard.audience.include_segments.length} included</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Delivery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Send</span>
                        <span className="font-medium capitalize">{wizard.delivery.send_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium">{wizard.delivery.messages_per_minute} / min</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Checklist */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                      <Shield className="h-4 w-4" />
                      Compliance Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Opt-in enforcement enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Opted-out contacts excluded</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Rate limiting active ({wizard.delivery.messages_per_minute}/min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Using approved template</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate('/campaigns')}>
                    Save as Draft
                  </Button>
                  <div className="flex items-center gap-3">
                    {wizard.delivery.send_type === 'scheduled' ? (
                      <Button 
                        onClick={() => handleSubmit(false)} 
                        disabled={isSubmitting}
                        className="min-w-32"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Campaign
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSubmit(true)} 
                        disabled={isSubmitting}
                        className="min-w-32 bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}