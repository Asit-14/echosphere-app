import { useState, useRef, useEffect } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import type { Message, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onDeleteMessage?: (messageId: string, forEveryone: boolean) => void;
}

export function MessageList({ messages, currentUser, isLoadingMore, onLoadMore, onDeleteMessage }: MessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom on new messages if already near bottom
  useEffect(() => {
    if (messages.length > 0) {
      // Simple auto-scroll for now, can be enhanced with atBottomStateChange
      // virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, align: 'end' });
    }
  }, [messages.length]);

  const DateDivider = ({ date }: { date: Date }) => (
    <div className="flex items-center justify-center my-4">
      <span className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
        {format(date, 'MMMM d, yyyy')}
      </span>
    </div>
  );

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      align: 'end',
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex-1 h-full relative bg-background/50" role="log" aria-live="polite" aria-label="Chat messages">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        data={messages}
        initialTopMostItemIndex={messages.length - 1}
        startReached={onLoadMore}
        followOutput="auto"
        atBottomStateChange={(atBottom) => setShowScrollButton(!atBottom)}
        itemContent={(index, message) => {
          const previousMessage = messages[index - 1];
          const showDateDivider = !previousMessage || !isSameDay(new Date(previousMessage.createdAt), new Date(message.createdAt));
          const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4"
            >
              {showDateDivider && <DateDivider date={new Date(message.createdAt)} />}
              <MessageBubble 
                message={message} 
                isOwn={message.senderId === currentUser.id}
                showAvatar={showAvatar}
                senderName={message.senderId === currentUser.id ? 'You' : 'Other'} 
                onDelete={onDeleteMessage}
              />
            </motion.div>
          );
        }}
        components={{
          Header: () => isLoadingMore ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : null,
        }}
      />

      {showScrollButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-4 right-4 z-20"
        >
          <Button 
            size="icon" 
            className="rounded-full shadow-lg bg-primary/90 hover:bg-primary"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
