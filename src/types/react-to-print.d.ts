// src/types/react-to-print.d.ts
import "react-to-print";

declare module "react-to-print" {
  interface UseReactToPrintOptions {
    content: () => HTMLElement | null;
    // Add any other missing properties here
  }
}
