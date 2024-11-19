// src/interfaces/ChatMessage.ts
export enum Sender {
    Admin = 'Admin',
    User = 'User',
  }
  
  export enum Status {
    Sent = 'sent',
    Seen = 'seen',
  }
  
  export interface ChatMessage {
    id: string;
    sender: 'Admin' | 'User';
    userId: string;
    message: string;
    status: 'sent' | 'seen';
    time: string;
  }
 