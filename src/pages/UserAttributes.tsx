import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Rocket
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UserAttribute {
  id: string;
  tenant_id: string;
  name: string;
  action_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewAttribute {
  id?: string;
  name: string;
  action_name: string;
  is_active: boolean;
  isNew?: boolean;
}

const DEFAULT_ATTRIBUTES = ['$Name', '$MobileNumber', '$LastName', '$FirstName'];

export default function UserAttributes() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newAttributes, setNewAttributes] = useState<NewAttribute[]>([]);
  const [editedAttributes, setEditedAttributes] = useState<Record<string, Partial<UserAttribute>>>({});

  // Fetch attributes
  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['user-attributes', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('user_attributes')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as UserAttribute[];
    },
    enabled: !!currentTenant?.id,
  });

  // Create attribute mutation
  const createMutation = useMutation({
    mutationFn: async (attr: NewAttribute) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      const { data, error } = await supabase
        .from('user_attributes')
        .insert({
          tenant_id: currentTenant.id,
          name: attr.name,
          action_name: attr.action_name || null,
          is_active: attr.is_active,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
    },
  });

  // Update attribute mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserAttribute> }) => {
      const { error } = await supabase
        .from('user_attributes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
    },
  });

  // Delete attribute mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_attributes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
      toast.success('Attribute deleted');
    },
  });

  const handleAddAttribute = () => {
    setNewAttributes([
      ...newAttributes,
      { name: '', action_name: '', is_active: true, isNew: true },
    ]);
  };

  const handleRemoveNewAttribute = (index: number) => {
    setNewAttributes(newAttributes.filter((_, i) => i !== index));
  };

  const handleNewAttributeChange = (index: number, field: keyof NewAttribute, value: string | boolean) => {
    setNewAttributes(newAttributes.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ));
  };

  const handleExistingAttributeChange = (id: string, field: keyof UserAttribute, value: string | boolean) => {
    setEditedAttributes({
      ...editedAttributes,
      [id]: {
        ...editedAttributes[id],
        [field]: value,
      },
    });
  };

  const handleSaveAll = async () => {
    try {
      // Save new attributes
      for (const attr of newAttributes) {
        if (attr.name.trim()) {
          await createMutation.mutateAsync(attr);
        }
      }

      // Update edited attributes
      for (const [id, updates] of Object.entries(editedAttributes)) {
        if (Object.keys(updates).length > 0) {
          await updateMutation.mutateAsync({ id, updates });
        }
      }

      setNewAttributes([]);
      setEditedAttributes({});
      toast.success('Attributes saved successfully');
    } catch (error) {
      console.error('Error saving attributes:', error);
      toast.error('Failed to save attributes');
    }
  };

  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.action_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && attr.is_active) ||
      (statusFilter === 'inactive' && !attr.is_active);
    return matchesSearch && matchesStatus;
  });

  const hasChanges = newAttributes.length > 0 || Object.keys(editedAttributes).length > 0;
  const maxAttributes = 5;
  const canAddMore = attributes.length + newAttributes.length < maxAttributes;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Attributes</h1>
        </div>

        {/* Quick Guide Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Quick Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Attributes hold Dialogflow parameters' value & you can also assign them custom value from contacts page.
            </p>
            <p className="text-sm text-muted-foreground">
              You can create upto {maxAttributes} user attributes, in addition to default attributes - {DEFAULT_ATTRIBUTES.join(', ')}
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="link" className="p-0 h-auto text-primary gap-1.5">
                <BookOpen className="w-4 h-4" />
                Add user attributes manually
              </Button>
              <Button variant="link" className="p-0 h-auto text-primary gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Attributes in SMEKSH
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  Take your experience to the next level — unlock 20 attributes with Pro! 
                  <Rocket className="w-4 h-4 inline ml-1" />
                </span>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by attributes name"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleAddAttribute}
            disabled={!canAddMore}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add attribute
          </Button>
          <Button 
            onClick={handleSaveAll}
            disabled={!hasChanges}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Attributes
          </Button>
        </div>

        {/* Attributes Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[35%]">Name*</TableHead>
                  <TableHead className="w-[35%]">Action(optional)</TableHead>
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                  <TableHead className="w-[15%] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Existing Attributes */}
                {filteredAttributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell>
                      <Input
                        value={editedAttributes[attr.id]?.name ?? attr.name}
                        onChange={(e) => handleExistingAttributeChange(attr.id, 'name', e.target.value)}
                        placeholder="Enter attribute name"
                        className="border-muted"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editedAttributes[attr.id]?.action_name ?? attr.action_name ?? ''}
                        onChange={(e) => handleExistingAttributeChange(attr.id, 'action_name', e.target.value)}
                        placeholder="Enter action name"
                        className="border-muted"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={editedAttributes[attr.id]?.is_active ?? attr.is_active}
                        onCheckedChange={(checked) => handleExistingAttributeChange(attr.id, 'is_active', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(attr.id)}
                        disabled={deleteMutation.isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* New Attributes */}
                {newAttributes.map((attr, index) => (
                  <TableRow key={`new-${index}`} className="bg-primary/5">
                    <TableCell>
                      <Input
                        value={attr.name}
                        onChange={(e) => handleNewAttributeChange(index, 'name', e.target.value)}
                        placeholder="Enter attribute name"
                        className="border-muted"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={attr.action_name}
                        onChange={(e) => handleNewAttributeChange(index, 'action_name', e.target.value)}
                        placeholder="Enter action name"
                        className="border-muted"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={attr.is_active}
                        onCheckedChange={(checked) => handleNewAttributeChange(index, 'is_active', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNewAttribute(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty State */}
                {filteredAttributes.length === 0 && newAttributes.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">No attributes yet</p>
                          <p className="text-sm text-muted-foreground">
                            Create your first custom attribute to personalize your contacts
                          </p>
                        </div>
                        <Button onClick={handleAddAttribute}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add attribute
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attribute Limit Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {attributes.length + newAttributes.length} / {maxAttributes} attributes used
          </p>
          {!canAddMore && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Limit reached - Upgrade for more
            </Badge>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
