// src/types.ts

export interface ISubtitle {
    title: string;
    titledetail: string;
  }
  
  export interface ISizeQuantity {
    size: string;
    quantity: number;
  }
  
  export interface IProduct {
    _id: string;
    product_name: string;
    code: string[];
    color: string[];
    sizes: ISizeQuantity[];
    originalPrice: number;
    offerPrice: number;
    title: string[];
    subtitle: ISubtitle[];
    description: string;
    images: string[];
  }
  
  export interface IProductCategory {
    catagory_name: string;
    product: IProduct[];
  }
  
  export interface IProductType {
    _id: string;
    types_name: string;
    product_catagory: IProductCategory[];
  }
  