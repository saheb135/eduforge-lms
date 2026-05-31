import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
};

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border glass-dark ${colors[type]} animate-slide-up max-w-sm`}>
      {icons[type]}
      <p className="text-sm text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, addToast, removeToast };
}
