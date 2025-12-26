import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatSidebarItem, ChatSidebarItemSkeleton } from './ChatSidebarItem';
import type { Conversation } from '../types';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ChatSidebar({ conversations, activeId, onSelect, isLoading }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r border-border bg-card/30 w-full md:w-auto">
      <div className="p-4 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-9 bg-background/50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ChatSidebarItemSkeleton key={i} />)
        ) : (
          conversations.map((conv) => (
            <ChatSidebarItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
