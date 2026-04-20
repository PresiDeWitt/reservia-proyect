import React, { type ReactNode } from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
    i18n: {
      language: 'es',
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        React.forwardRef<HTMLElement, { children?: ReactNode } & Record<string, unknown>>(
          ({ children, ...props }, ref) =>
            React.createElement(tag, { ...props, ref }, children)
        ),
    }
  );

  const AnimatePresence = ({ children }: { children: ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return { motion, AnimatePresence };
});
