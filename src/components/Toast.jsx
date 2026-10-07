import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'error' ? (
            <AlertCircle size={18} stroke="#f87171" strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={18} stroke="#34d399" strokeWidth={2.5} />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
