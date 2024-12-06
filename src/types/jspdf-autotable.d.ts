// src/types/jspdf-autotable.d.ts

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  // Default export: autoTable function
  function autoTable(doc: jsPDF, options: autoTable.Options): jsPDF;

  // Namespace containing types and interfaces
  namespace autoTable {
      type CellInput = string | number | boolean | null | undefined;

      export interface Options {
          startY?: number;
          head?: CellInput[][];
          body?: CellInput[][];
          styles?: StylesOptions; // Added 'styles' property
          headStyles?: HeadStylesOptions;
          bodyStyles?: BodyStylesOptions;
          alternateRowStyles?: AlternateRowStylesOptions;
          theme?: string;
          didDrawPage?: (data: HookData) => void;
          margin?: { left: number; right: number; top?: number; bottom?: number };
          showHead?: 'everyPage' | 'firstPage';
          // Add other options as needed
      }

      // Define types for various style options
      export interface StylesOptions {
          fontSize?: number;
          textColor?: number | string;
          fillColor?: number | string | number[];
          lineColor?: number | string | number[];
          lineWidth?: number;
          // Add more style properties as needed
      }

      export interface HeadStylesOptions extends StylesOptions {
          halign?: 'left' | 'center' | 'right';
          valign?: 'top' | 'middle' | 'bottom';
          // Add more head-specific style properties if needed
      }

      export interface BodyStylesOptions extends StylesOptions {
          halign?: 'left' | 'center' | 'right';
          valign?: 'top' | 'middle' | 'bottom';
          // Add more body-specific style properties if needed
      }

      export type AlternateRowStylesOptions = StylesOptions
  }

  // Export the 'Options' interface as a named export
  export type Options = autoTable.Options;

  // Default export
  export default autoTable;
}

declare module 'jspdf' {
  interface jsPDF {
      lastAutoTable?: {
          finalY: number;
          // Add other properties if needed
      };
  }
}
