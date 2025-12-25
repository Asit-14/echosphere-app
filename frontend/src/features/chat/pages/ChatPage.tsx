import { ChatSidebar } from '../components/ChatSidebar';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { FileDropzone } from '@/features/media/components/FileDropzone';
import { useChat } from '../hooks/useChat';
import { useAuth } from '@/context/AuthContext';

export default function ChatPage() {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    activeId, 
    setActiveId, 
    sendMessage, 
    deleteMessage, 
    activeUser 
  } = useChat();

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="w-80 hidden md:flex flex-col border-r border-border">
        <ChatSidebar 
          conversations={conversations} 
          activeId={activeId} 
          onSelect={setActiveId} 
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-3xl relative">
        <FileDropzone onFilesDropped={(files) => console.log('Dropped', files)}>
          <div className="flex flex-col h-full">
            {activeUser ? (
              <>
                <ChatHeader user={activeUser} />
                {user && (
                  <MessageList 
                    messages={messages} 
                    currentUser={user}
                    onDeleteMessage={deleteMessage}
                  />
                )}
                <ChatInput onSendMessage={sendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </FileDropzone>
      </div>
    </div>
  );
}
