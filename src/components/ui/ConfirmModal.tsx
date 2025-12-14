"use client";

import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-2">{message}</p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
