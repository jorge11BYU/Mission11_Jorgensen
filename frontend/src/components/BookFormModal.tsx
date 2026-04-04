import { useState, useEffect } from 'react'

type Book = {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

type BookFormModalProps = {
  show: boolean
  book: Book | null // null = adding, non-null = editing
  onClose: () => void
  onSave: (book: Omit<Book, 'bookId'> & { bookId?: number }) => void
  saving: boolean
}

const emptyForm = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

/**
 * BookFormModal
 *
 * A modern modal dialog for creating or editing a book.
 * Uses CSS backdrop-blur glassmorphism for a premium look.
 */
export function BookFormModal({ show, book, onClose, onSave, saving }: BookFormModalProps) {
  const [form, setForm] = useState(emptyForm)
  const isEdit = book !== null

  // Sync form state with the book prop whenever it changes
  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        isbn: book.isbn,
        classification: book.classification,
        category: book.category,
        pageCount: book.pageCount,
        price: book.price,
      })
    } else {
      setForm(emptyForm)
    }
  }, [book, show])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit && book) {
      onSave({ ...form, bookId: book.bookId })
    } else {
      onSave(form)
    }
  }

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-custom">
          <h5 className="mb-0">{isEdit ? '✏️ Edit Book' : '📚 Add New Book'}</h5>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <div className="form-grid">
              <div className="form-group-custom">
                <label htmlFor="bookTitle">Title</label>
                <input
                  id="bookTitle"
                  name="title"
                  type="text"
                  className="form-input-custom"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookAuthor">Author</label>
                <input
                  id="bookAuthor"
                  name="author"
                  type="text"
                  className="form-input-custom"
                  value={form.author}
                  onChange={handleChange}
                  required
                  placeholder="Author name"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookPublisher">Publisher</label>
                <input
                  id="bookPublisher"
                  name="publisher"
                  type="text"
                  className="form-input-custom"
                  value={form.publisher}
                  onChange={handleChange}
                  required
                  placeholder="Publisher name"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookIsbn">ISBN</label>
                <input
                  id="bookIsbn"
                  name="isbn"
                  type="text"
                  className="form-input-custom"
                  value={form.isbn}
                  onChange={handleChange}
                  required
                  placeholder="ISBN number"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookClassification">Classification</label>
                <input
                  id="bookClassification"
                  name="classification"
                  type="text"
                  className="form-input-custom"
                  value={form.classification}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Fiction, Non-Fiction"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookCategory">Category</label>
                <input
                  id="bookCategory"
                  name="category"
                  type="text"
                  className="form-input-custom"
                  value={form.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Science, History"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookPageCount">Page Count</label>
                <input
                  id="bookPageCount"
                  name="pageCount"
                  type="number"
                  className="form-input-custom"
                  value={form.pageCount || ''}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Number of pages"
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="bookPrice">Price ($)</label>
                <input
                  id="bookPrice"
                  name="price"
                  type="number"
                  className="form-input-custom"
                  value={form.price || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer-custom">
            <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-save" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving…
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
