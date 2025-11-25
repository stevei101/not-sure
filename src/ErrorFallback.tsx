import { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
        <pre className="text-sm text-muted-foreground mb-4 overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

