/// <reference types="vite/client" />

interface Window {
  tikzjax?: {
    parse: (element: Element) => void;
  };
}