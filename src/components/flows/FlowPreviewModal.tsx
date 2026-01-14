import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowName: string;
  nodes: any[];
}

interface PreviewMessage {
  id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  buttons?: { id: string; label: string }[];
  listItems?: { id: string; title: string; description?: string }[];
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const FlowPreviewModal: React.FC<FlowPreviewModalProps> = ({
  open,
  onOpenChange,
  flowName,
  nodes,
}) => {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);

  const simulateFlow = async () => {
    setMessages([]);
    setCurrentNodeIndex(0);

    // Initial user message
    setMessages([{
      id: '0',
      type: 'incoming',
      text: 'Hello!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);

    // Process each node
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.node_type === 'start') continue;

      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      setIsTyping(false);

      const message: PreviewMessage = {
        id: String(i + 1),
        type: 'outgoing',
        text: node.config?.message || `[${node.label || node.node_type}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      // Add buttons for text-buttons node
      if (node.node_type === 'text-buttons' && node.config?.buttons) {
        message.buttons = node.config.buttons.map((b: string, idx: number) => ({
          id: String(idx),
          label: b,
        }));
      }

      // Add list items for list-message node
      if (node.node_type === 'list-message' && node.config?.items) {
        message.listItems = node.config.items.map((item: any, idx: number) => ({
          id: String(idx),
          title: item.title || item,
          description: item.description,
        }));
      }

      setMessages(prev => [...prev, message]);
      setCurrentNodeIndex(i);

      await new Promise(r => setTimeout(r, 500));
    }
  };

  const handleButtonClick = (buttonLabel: string) => {
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      type: 'incoming',
      text: buttonLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      type: 'incoming',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setUserInput('');
  };

  React.useEffect(() => {
    if (open) {
      simulateFlow();
    }
  }, [open, nodes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="flex flex-col h-[600px] bg-gradient-to-b from-[#128C7E]/10 to-background">
          {/* WhatsApp-style header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#128C7E] text-white">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{flowName}</p>
              <p className="text-xs text-white/70">Flow Preview</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div 
              className="space-y-2"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.type === 'incoming' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 shadow-sm',
                      msg.type === 'incoming'
                        ? 'bg-[#DCF8C6] text-foreground rounded-tr-none'
                        : 'bg-card text-foreground rounded-tl-none'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Buttons */}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.buttons.map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => handleButtonClick(btn.label)}
                            className="w-full py-2 px-3 text-sm text-[#128C7E] bg-white border border-[#128C7E]/30 rounded-lg hover:bg-[#128C7E]/5 transition-colors"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* List items */}
                    {msg.listItems && msg.listItems.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.listItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      {msg.type === 'outgoing' && msg.status && (
                        msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card rounded-lg px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-t">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Smile className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Input
              placeholder="Type a message"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-card border-0"
            />
            <Button
              size="icon"
              className="shrink-0 bg-[#128C7E] hover:bg-[#128C7E]/90"
              onClick={handleSendMessage}
            >
              {userInput ? (
                <Send className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
