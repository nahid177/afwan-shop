// src/types/domtoimage.d.ts
declare module 'dom-to-image' {
    interface Options {
      useCORS?: boolean; // Allow `useCORS` as a valid option
    }
  
    const domtoimage: {
      toPng(element: HTMLElement, options?: Options): Promise<string>;
      // Other methods if needed
    };
  
    export = domtoimage;
  }
  