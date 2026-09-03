import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let uid = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = ++uid;
    setToasts((ts) => [...ts, { id, type, message }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };

  return (
    <ToastContext.Provider value={{
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      warning: (m) => push('warning', m),
      info: (m) => push('info', m)
    }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => {
          const I = icons[t.type] || Info;
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <I size={18} />
              <span>{t.message}</span>
              <button className="toast-close" onClick={() => dismiss(t.id)}><X size={15} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}