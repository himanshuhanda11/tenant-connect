import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '@/types/whatsapp';

export default function Contacts() {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentTenant) {
      fetchContacts();
    }
  }, [currentTenant]);

  const fetchContacts = async () => {
    if (!currentTenant) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('last_seen', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setContacts((data || []) as Contact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.wa_id.includes(query)
    );
  });

  const getInitials = (name?: string, waId?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const openConversation = async (contact: Contact) => {
    // Find or navigate to conversation with this contact
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (conversation) {
      navigate(`/inbox?conversation=${conversation.id}`);
    } else {
      navigate('/inbox');
      toast.info('No conversation found with this contact');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground">View and manage your WhatsApp contacts</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchContacts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Contacts
                </CardTitle>
                <CardDescription>
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''} in your workspace
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No contacts matching "{searchQuery}"</p>
                ) : (
                  <>
                    <p>No contacts yet</p>
                    <p className="text-sm">Contacts will appear here when they message you</p>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>WhatsApp ID</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={contact.profile_picture_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(contact.name, contact.wa_id)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.name || 'Unknown'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        +{contact.wa_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastSeen(contact.last_seen)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openConversation(contact)}
                          title="Open conversation"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
