import React from "react";

interface ActionConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
}

const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  icon,
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            {icon}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-gray-100 py-3 text-sm font-medium text-gray-700 active:scale-95 transition-transform"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl py-3 text-sm font-medium text-white active:scale-95 transition-transform"
            style={{ backgroundColor: "#1a5c2a" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmModal;