import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onMentionsChange?: (mentionIds: string[]) => void;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
  onMentionsChange,
}: MentionTextareaProps) {
  const { currentTenant } = useTenant();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch team members once
  useEffect(() => {
    if (!currentTenant?.id) return;

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('tenant_members')
        .select('user_id')
        .eq('tenant_id', currentTenant.id);

      if (!data?.length) return;

      const userIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (profiles) {
        setTeamMembers(
          profiles.map((p) => ({
            id: p.id,
            full_name: p.full_name || p.email || 'Unknown',
            email: p.email || '',
            avatar_url: p.avatar_url,
          }))
        );
      }
    };

    fetchMembers();
  }, [currentTenant?.id]);

  const filteredMembers = teamMembers.filter((m) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  // Extract mention IDs from text
  const extractMentions = useCallback(
    (text: string) => {
      const ids: string[] = [];
      const regex = /@(\w[\w\s]*?)(?=\s@|$|\s[^@])/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const name = match[1].trim();
        const member = teamMembers.find(
          (m) => m.full_name.toLowerCase() === name.toLowerCase()
        );
        if (member) ids.push(member.id);
      }
      return ids;
    },
    [teamMembers]
  );

  useEffect(() => {
    if (onMentionsChange) {
      onMentionsChange(extractMentions(value));
    }
  }, [value, extractMentions, onMentionsChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);

    // Check if we're in a mention context
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show dropdown if there's no space before the @ (or it's at start)
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) && !/\n/.test(textAfterAt)) {
        setShowDropdown(true);
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setSelectedIndex(0);
        return;
      }
    }

    setShowDropdown(false);
  };

  const insertMention = (member: TeamMember) => {
    const before = value.slice(0, mentionStartIndex);
    const after = value.slice(
      (textareaRef.current?.selectionStart || mentionStartIndex + mentionQuery.length + 1)
    );
    const newValue = `${before}@${member.full_name} ${after}`;
    onChange(newValue);
    setShowDropdown(false);
    setMentionQuery('');

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mentionStartIndex + member.full_name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredMembers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredMembers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredMembers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 200);
        }}
      />

      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-full max-h-40 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50"
        >
          {filteredMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                index === selectedIndex && 'bg-accent'
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(member);
              }}
            >
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">{member.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
