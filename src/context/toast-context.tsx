import React, { createContext, useContext, useState, useCallback } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now();
    const newToast: Toast = {
      id,
      message: config.message,
      type: config.type || "info", // Default to "info"
      duration: config.duration || 3000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - Fixed position */}
      <div className="fixed top-20 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Individual Toast Notification Component
interface ToastNotificationProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const styles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-gray-900",
    info: "bg-blue-500 text-white",
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div
      className={`${styles[type]} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right max-w-md`} // ✅ Added backtick
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {icons[type]}
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={20} />
      </button>
    </div>
  );
};

// Hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
