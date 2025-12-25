import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from '@/features/media/components/VoiceRecorder';
import { AttachmentList } from '@/features/media/components/AttachmentList';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[], audio?: Blob) => void;
  onAttach?: () => void;
  isTyping?: boolean;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_CHARS = 2000;
  // const { theme } = useTheme(); // Assuming ThemeContext exists, otherwise default to auto

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    
    onSendMessage(content, attachments);
    setContent('');
    setAttachments([]);
    setShowEmojiPicker(false);
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleVoiceSend = (blob: Blob) => {
    onSendMessage('', [], blob);
    setIsRecording(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm relative">
      {/* Attachments Preview */}
      <AttachmentList files={attachments} onRemove={removeAttachment} />

      {showEmojiPicker && (
        <div className="absolute bottom-full right-4 mb-2 z-50 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-background border border-border rounded-xl">
             <div className="flex justify-end p-2 border-b border-border bg-muted/30">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEmojiPicker(false)}>
                  <X className="h-4 w-4" />
                </Button>
             </div>
             <EmojiPicker 
               onEmojiClick={onEmojiClick} 
               theme={Theme.AUTO}
               width={320}
               height={400}
               lazyLoadEmojis={true}
             />
           </div>
        </div>
      )}

      {isRecording ? (
        <div className="p-4">
          <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setIsRecording(false)} />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex gap-1 pb-2">
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground" 
                onClick={() => fileInputRef.current?.click()} 
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 relative bg-muted/50 rounded-2xl border border-input focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                maxLength={MAX_CHARS}
                className="w-full bg-transparent px-4 py-3 min-h-[44px] max-h-[200px] resize-none focus:outline-none text-sm scrollbar-hide"
                aria-label="Message input"
              />
              
              <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", showEmojiPicker && "text-primary bg-primary/10")}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="pb-1">
              {content.trim() || attachments.length > 0 ? (
                <Button 
                  onClick={handleSend} 
                  size="icon" 
                  className="h-10 w-10 rounded-full transition-all duration-200 animate-in zoom-in-50"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="Record voice message"
                  onClick={() => setIsRecording(true)}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-1 flex justify-between px-1">
            <span className="text-[10px] text-muted-foreground">
              {/* Typing indicator placeholder */}
            </span>
            <span className={cn("text-[10px]", content.length > MAX_CHARS * 0.9 ? "text-destructive" : "text-muted-foreground")}>
              {content.length > 0 && `${content.length}/${MAX_CHARS}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
