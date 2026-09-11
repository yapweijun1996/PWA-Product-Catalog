/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module '*.woff' {
  const source: string;
  export default source;
}

declare module '*.woff2' {
  const source: string;
  export default source;
}
