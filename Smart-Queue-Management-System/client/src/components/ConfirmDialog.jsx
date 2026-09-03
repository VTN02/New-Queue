import { X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="pill">{title}</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        {message && <p className="modal-msg">{message}</p>}
        {children}
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}