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
    <div className="flex h-full overflow-hidden bg-background relative">
      {/* Sidebar - Hidden on mobile when chat is active */}
      <div className={`w-full md:w-80 flex-col border-r border-border absolute md:relative z-10 bg-background h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <ChatSidebar 
          conversations={conversations} 
          activeId={activeId} 
          onSelect={setActiveId} 
        />
      </div>

      {/* Chat Area - Hidden on mobile when no chat is active */}
      <div className={`flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-3xl relative w-full h-full ${!activeId ? 'hidden md:flex' : 'flex'}`}>
        <FileDropzone onFilesDropped={(files) => console.log('Dropped', files)}>
          <div className="flex flex-col h-full">
            {activeUser ? (
              <>
                <ChatHeader 
                  user={activeUser} 
                  onBack={() => setActiveId('')}
                />
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
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
                <div className="max-w-md space-y-2">
                  <h3 className="text-lg font-semibold">Welcome to EchoSphere</h3>
                  <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
                </div>
              </div>
            )}
          </div>
        </FileDropzone>
      </div>
    </div>
  );
}
