type DeleteConfirmModalProps = {
  show: boolean
  bookTitle: string
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}

/**
 * DeleteConfirmModal
 *
 * A lightweight confirmation dialog shown before permanently deleting a book.
 * Features a warning icon, the book title, and Cancel / Delete actions.
 */
export function DeleteConfirmModal({ show, bookTitle, onClose, onConfirm, deleting }: DeleteConfirmModalProps) {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-custom modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-custom modal-header-danger">
          <h5 className="mb-0">🗑️ Delete Book</h5>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-custom text-center">
          <div className="delete-warning-icon">⚠️</div>
          <p className="mt-3 mb-1">Are you sure you want to delete</p>
          <p className="fw-bold fs-5 mb-3">"{bookTitle}"?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </div>

        {/* Footer */}
        <div className="modal-footer-custom">
          <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="btn-modal-delete" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Deleting…
              </>
            ) : (
              'Delete Book'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
