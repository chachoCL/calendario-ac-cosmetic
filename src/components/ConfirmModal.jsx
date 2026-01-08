/**
 * Confirm Modal Component
 * Custom confirmation dialog to replace browser's window.confirm()
 */

import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    {/* Warning Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2">
                        {title || '¿Estás seguro?'}
                    </h3>

                    {/* Message */}
                    <p className="text-[var(--color-text-muted)] mb-6">
                        {message || 'Esta acción no se puede deshacer.'}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            No, Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="btn btn-danger flex-1"
                        >
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
