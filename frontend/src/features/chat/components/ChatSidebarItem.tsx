import { format, isToday, isYesterday } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Conversation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatSidebarItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ChatSidebarItem({ conversation, isActive, onClick }: ChatSidebarItemProps) {
  const otherUser = conversation.participants[0]; // Simplified for 1:1

  const getSmartTime = (date: Date) => {
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MM/dd/yy');
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-left group relative",
        !isActive && "hover:bg-muted/50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeChat"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      
      <div className="relative z-10">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback>{otherUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {otherUser.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 z-10">
        <div className="flex justify-between items-baseline mb-1">
          <span className={cn("font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
            {otherUser.name}
          </span>
          {conversation.lastMessage && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {getSmartTime(new Date(conversation.lastMessage.createdAt))}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-sm truncate max-w-[140px]",
            conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {conversation.isTyping ? (
              <span className="text-primary italic">Typing...</span>
            ) : (
              conversation.lastMessage?.content || "No messages yet"
            )}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] flex items-center justify-center px-1">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

export function ChatSidebarItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
