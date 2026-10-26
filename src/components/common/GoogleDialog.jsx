import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  X,
  Trash2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const GoogleDialogContext = createContext(null);

export function GoogleDialogProvider({ children }) {
  // Modal state (for confirms and important alerts)
  const [modalConfig, setModalConfig] = useState(null);

  // Toast / Snackbar state (for quick alerts and notifications)
  const [toasts, setToasts] = useState([]);

  // Google Confirm Dialog
  const showConfirm = useCallback(
    ({
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger', // 'danger' | 'info' | 'warning'
      onConfirm = () => {},
      onCancel = () => {},
    }) => {
      setModalConfig({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setModalConfig(null);
          try {
            onConfirm();
          } catch (e) {
            console.error(e);
          }
        },
        onCancel: () => {
          setModalConfig(null);
          try {
            onCancel();
          } catch (e) {}
        },
      });
    },
    []
  );

  // Google Toast / Snackbar
  const showToast = useCallback(({ message, title = '', type = 'info', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, message, title, type, duration };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // Shortcut for alerts: shows toast for simple alerts or modal for errors
  const showAlert = useCallback(
    (message, type = 'info', title = '') => {
      showToast({ message, type, title: title || (type === 'error' ? 'Notice' : 'Google Workspace Alert') });
    },
    [showToast]
  );

  // Automatically replace native browser window.alert with Google Workspace Toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (msg) => {
        showToast({
          message: String(msg || ''),
          title: 'Google Workspace Alert',
          type: String(msg || '').toLowerCase().includes('error') ? 'error' : 'info',
          duration: 4500,
        });
      };
      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showToast]);

  // Close active modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalConfig) {
        modalConfig.onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalConfig]);

  return (
    <GoogleDialogContext.Provider value={{ showConfirm, showToast, showAlert }}>
      {children}

      {/* 1. GOOGLE WORKSPACE MODAL CONFIRMATION BOX */}
      {modalConfig && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 selection:bg-blue-500 selection:text-white font-sans"
          onClick={modalConfig.onCancel}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Google Institutional Pill Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                {/* Google 4-Color Dots Accent */}
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Google Workspace • Campus Portal
                </span>
              </div>
              <button
                onClick={modalConfig.onCancel}
                className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon + Title */}
            <div className="flex items-start gap-3.5 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  modalConfig.type === 'danger'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                    : modalConfig.type === 'warning'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-blue-500/10'
                }`}
              >
                {modalConfig.type === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : modalConfig.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {modalConfig.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {modalConfig.message}
                </p>
              </div>
            </div>

            {/* Google Style Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={modalConfig.onCancel}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                {modalConfig.cancelText}
              </button>

              <button
                type="button"
                autoFocus
                onClick={modalConfig.onConfirm}
                className={`px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 ${
                  modalConfig.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : modalConfig.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                }`}
              >
                <span>{modalConfig.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GOOGLE WORKSPACE SNACKBAR / TOAST POPUPS */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100000] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4 font-sans">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs text-slate-100 animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-center gap-2.5">
              {/* Google Dot Accent */}
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                <span className="w-2 h-2 rounded-full bg-[#34A853]" />
              </div>

              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : t.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : t.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              )}

              <div>
                {t.title && <p className="font-bold text-white text-[11px] leading-tight">{t.title}</p>}
                <p className="text-[12px] text-slate-200 font-medium leading-tight">{t.message}</p>
              </div>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </GoogleDialogContext.Provider>
  );
}

export function useGoogleDialog() {
  const context = useContext(GoogleDialogContext);
  if (!context) {
    throw new Error('useGoogleDialog must be used within a GoogleDialogProvider');
  }
  return context;
}
