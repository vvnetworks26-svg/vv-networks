/**
 * Error Boundary — wraps children and catches render errors.
 *
 * Uses a React class component internally via a type-safe wrapper.
 * The inner class is typed with an explicit interface cast so TypeScript
 * can resolve state/props regardless of useDefineForClassFields setting.
 */
import React from "react";
import type { ReactNode } from "react";

interface FallbackProps {
  onReset: () => void;
}

function DefaultFallback({ onReset }: FallbackProps) {
  return (
    <div
      role="alert"
      className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 py-24 space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black text-2xl mx-auto">
        V
      </div>
      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-brand-slate-500 leading-relaxed">
          We hit an unexpected error. Refreshing usually fixes it. If the
          problem persists, reach out at{" "}
          <a
            href="mailto:vvnetworks26@gmail.com"
            rel="noopener"
            className="text-brand-blue hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue rounded"
          >
            vvnetworks26@gmail.com
          </a>
          .
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
        >
          Reload page
        </button>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl border border-brand-slate-200 text-brand-slate-700 hover:text-brand-navy text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface EBProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Type the instance explicitly so TypeScript resolves inherited members
type EBInstance = React.Component<EBProps, { hasError: boolean }>;

// Build the class expression with a typed cast
const EBClass = class extends React.Component<EBProps, { hasError: boolean }> {
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): ReactNode {
    const self = this as unknown as EBInstance;
    const { hasError } = self.state ?? { hasError: false };
    const { children, fallback } = self.props;
    if (!hasError) return children;
    if (fallback) return fallback;
    return (
      <DefaultFallback
        onReset={() => {
          (self as unknown as { setState: (s: object) => void }).setState({ hasError: false });
        }}
      />
    );
  }
} as unknown as new (props: EBProps) => React.Component<EBProps, { hasError: boolean }>;

export default function ErrorBoundary({ children, fallback }: EBProps): ReactNode {
  // Wrap in a React element — EBClass handles the boundary logic
  return React.createElement(EBClass as React.ComponentType<EBProps>, { fallback }, children);
}
