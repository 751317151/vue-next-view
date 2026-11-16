/**
 * Ambient declarations for third-party packages that ship no TypeScript types.
 * They are only used for progressive enhancement (markdown preview, scroll
 * reveal, table of contents); first-party code stays fully typed.
 */

declare module 'aos' {
  interface AosOptions {
    duration?: number;
    easing?: string;
    once?: boolean;
    offset?: number;
    delay?: number;
    disable?: boolean | 'phone' | 'tablet' | 'mobile' | (() => boolean);
  }

  function init(options?: AosOptions): void;
  function refresh(hard?: boolean): void;
  function refreshHard(): void;

  export { init, refresh, refreshHard };
  export type { AosOptions };
}

declare module 'tocbot' {
  interface TocbotOptions {
    tocSelector?: string;
    contentSelector?: string;
    headingSelector?: string;
    hasInnerContainers?: boolean;
    scrollSmooth?: boolean;
    scrollSmoothOffset?: number;
    headingsOffset?: number;
    collapseDepth?: number;
    fixedSidebarOffset?: string | number;
    onClick?: (event: MouseEvent) => void;
  }

  function init(options?: TocbotOptions): void;
  function destroy(): void;
  function refresh(): void;

  export { init, destroy, refresh };
  export type { TocbotOptions };
}

declare module '@kangc/v-md-editor';
declare module '@kangc/v-md-editor/lib/preview';
declare module '@kangc/v-md-editor/lib/theme/github.js';
declare module '@kangc/v-md-editor/lib/theme/style/github.css';
