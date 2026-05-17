import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export function Toast({ type, message, onClose }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        type === 'success'
          ? 'bg-white border-emerald-200 text-emerald-700'
          : 'bg-white border-red-200 text-tetri-error'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const ToastContainer = toast ? (
    <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastContainer };
}
