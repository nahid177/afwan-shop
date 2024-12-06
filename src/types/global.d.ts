// src/types/global.d.ts

import { jsPDF } from "jspdf";

// Module augmentation for jsPDF to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

// Define the AutoTableOptions interface if it's not available
// This is a simplified version. For comprehensive type definitions, refer to jspdf-autotable documentation.
interface AutoTableOptions {
  startY: number;
  head: string[][];
  body: string[][];
  styles?: {
    fontSize?: number;
    textColor?: number;
    lineColor?: number;
    lineWidth?: number;
  };
  headStyles?: {
    fillColor?: [number, number, number];
    textColor?: number;
    halign?: string;
  };
  theme?: string;
  didDrawPage?: (data: HookData) => void;
}

// Define the HookData interface
interface HookData {
  pageNumber: number;
  settings: {
    margin: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
  doc: jsPDF;
}
