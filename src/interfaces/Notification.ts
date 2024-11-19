// src/interfaces/Notification.ts
export interface Notification {
    _id: string;
    title: string;
    detail: string;
    endTime: string; // ISO string
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  