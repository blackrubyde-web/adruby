import React from 'react';
import Modal from './Modal';
import { UI } from './uiPrimitives';

const ConfirmDialog = ({
  open,
  title = 'Bist du sicher?',
  description,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      subtitle={description}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className={UI.btnSecondary}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={UI.btnPrimary}>
            {confirmLabel}
          </button>
        </div>
      }
    />
  );
};

export default ConfirmDialog;
