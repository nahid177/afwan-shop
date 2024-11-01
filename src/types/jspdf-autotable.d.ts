// src/types/jspdf-autotable.d.ts

declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';
  
    function autoTable(doc: jsPDF, options: autoTable.Options): jsPDF;
  
    namespace autoTable {
      type CellInput = string | number | boolean | null | undefined;
  
      interface Options {
        startY?: number;
        head?: CellInput[][];
        body?: CellInput[][];
        // You can add more options as needed
      }
    }
  
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
  