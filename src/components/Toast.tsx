'use client';

import { useToastStore } from '@/lib/useToast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="ob-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ob-toast ob-toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
