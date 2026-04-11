'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-500 mb-2">
          <AlertCircle size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-slate-500 text-sm">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
            <p className="text-xs font-mono text-red-600 line-clamp-4">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => reset()}
            variant="default"
            size="lg"
            className="flex-1 font-medium gap-2"
          >
            <RefreshCcw size={18} />
            Try again
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="flex-1 font-medium gap-2"
          >
            <Home size={18} />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
