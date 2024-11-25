// src/interfaces/IOrderClient.ts

export interface IOrderClient {
    _id: string;
    customerName: string;
    customerNumber: string;
    otherNumber?: string;
    address1: string;
    address2?: string;
    items: IOrderItemClient[];
    totalAmount: number;
    approved: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    // Include other necessary properties
  }
  
  export interface IOrderItemClient {
    productId: string;
    code: string[];
    buyingPrice?: number;
    quantity?: number;
    image: string;
    // Include other necessary properties
  }
  