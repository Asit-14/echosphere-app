import { format } from 'date-fns';
import { Check, CheckCheck, Clock, Play, Pause, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, MessageStatus } from '../types';
import { LinkPreview } from '@/features/media/components/LinkPreview';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  onDelete?: (messageId: string, forEveryone: boolean) => void;
}

export function MessageBubble({ message, isOwn, showAvatar, senderName, onDelete }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const StatusIcon = ({ status }: { status: MessageStatus }) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent': return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-primary" />;
      case 'failed': return <span className="text-destructive text-xs">!</span>;
      default: return null;
    }
  };

  // Extract URLs from text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content.match(urlRegex);

  return (
    <div className={cn("flex w-full mb-4 group", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[70%] flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && showAvatar && senderName && (
          <span className="text-xs text-muted-foreground ml-1 mb-1">{senderName}</span>
        )}
        
        <div className="flex items-end gap-2">
          {isOwn && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <MoreVertical className="h-3 w-3" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => onDelete?.(message.id, false)}>
                   <Trash2 className="mr-2 h-4 w-4" />
                   Delete for me
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onDelete?.(message.id, true)}>
                   <Trash2 className="mr-2 h-4 w-4" />
                   Delete for everyone
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          )}

          <div
            className={cn(
              "relative px-4 py-2 rounded-2xl shadow-sm text-sm break-words",
              isOwn 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border border-border rounded-tl-sm"
            )}
          >
            {message.type === 'text' && (
              <>
                {message.content}
                {urls && urls.length > 0 && (
                  <div className="mt-2">
                    <LinkPreview url={urls[0]} />
                  </div>
                )}
              </>
            )}
            
            {message.type === 'image' && message.attachments && message.attachments.length > 0 && (
               <div className="rounded-lg overflow-hidden my-1">
                  {message.attachments.map((att, i) => (
                    <img 
                      key={i} 
                      src={att.url.startsWith('http') ? att.url : `http://localhost:8000${att.url}`} 
                      alt="Attachment" 
                      className="max-w-full h-auto mb-1 last:mb-0 rounded" 
                    />
                  ))}
                  {message.content && message.content !== 'Image' && <p className="mt-1">{message.content}</p>}
               </div>
            )}

            {message.type === 'audio' && message.attachments && message.attachments.length > 0 && (
               <div className="flex items-center gap-2 min-w-[200px] py-1">
                  <audio 
                    controls 
                    src={message.attachments[0].url.startsWith('http') ? message.attachments[0].url : `http://localhost:8000${message.attachments[0].url}`} 
                    className="w-full h-8" 
                  />
               </div>
            )}

            {/* Fallback for legacy 'file' type or missing attachments */}
            {message.type === 'file' && message.content === 'Audio Message' && (
               <div className="flex items-center gap-2 min-w-[150px] py-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-full", isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted")}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="h-1 flex-1 bg-current/20 rounded-full overflow-hidden">
                     <div className="h-full bg-current w-1/2" />
                  </div>
                  <span className="text-xs font-mono opacity-80">0:12</span>
               </div>
            )}
            
            <div className={cn(
              "flex items-center justify-end gap-1 mt-1 select-none",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              <span className="text-[10px]">
                {format(new Date(message.createdAt), 'HH:mm')}
              </span>
              {isOwn && <StatusIcon status={message.status} />}
            </div>
          </div>

          {!isOwn && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <MoreVertical className="h-3 w-3" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start">
                 <DropdownMenuItem onClick={() => onDelete?.(message.id, false)}>
                   <Trash2 className="mr-2 h-4 w-4" />
                   Delete for me
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          )}
        </div>

        {/* Link Previews */}
        {urls && urls.map((url, i) => (
          <LinkPreview key={i} url={url} />
        ))}
      </div>
    </div>
  );
}
