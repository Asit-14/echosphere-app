export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy' | string;
  lastSeen?: Date;
  privacy?: {
    readReceipts: boolean;
    lastSeen: boolean;
  };
}

export interface Attachment {
  url: string;
  mimeType: string;
  size: number;
  fileName: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  status: MessageStatus;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyToId?: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  chatId?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  updatedAt: Date;
}
