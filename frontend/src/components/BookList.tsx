import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CategorySidebar } from './CategorySidebar'
import { useCart } from '../context/CartContext'
import { BookFormModal } from './BookFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

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

type BooksApiResponse = {
  total: number
  page: number
  pageSize: number
  totalPages: number
  books: Book[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://mission13-jorgensen-backend-ckbxgyafacb7g0dx.francecentral-01.azurewebsites.net'

/**
 * BookList Component
 * 
 * The primary catalog view of the application. It dynamically fetches paginated book data 
 * from the API based on the current URL search parameters.
 * 
 * Key Architectural Decisions:
 * - Pagination & Filtering: State is stored in the URL (`?page=2&category=Fiction`) instead of 
 *   React `useState`. This allows users to bookmark specific pages and interact flawlessly with 
 *   the browser's Back/Forward buttons and the Shopping Cart's "Continue Shopping" fallback.
 * - Add to Cart: Integrates with CartContext and features a 3-second Toast alert built purely 
 *   in React without requiring the bulky Bootstrap JS bundle.
 * - CRUD: Inline Edit/Delete buttons per row, plus an "Add Book" button above the table.
 *   Both Add and Edit open a modal dialog; Delete shows a confirmation modal.
 */
function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()
  
  // Derive active parameters directly from the URL. Fallback to defaults.
  const pageParam = searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const selectedCategory = searchParams.get('category') || ''

  const [books, setBooks] = useState<Book[]>([])
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const toastTimeoutRef = useRef<number | null>(null)

  // CRUD Modal State
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [saving, setSaving] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)

  // A counter that increments after every successful CRUD operation to trigger re-fetch
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = (message: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(message)
    setToastVariant(variant)
    if (toastTimeoutRef.current !== null) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000) as unknown as number
  }

  const handleAddToCart = (book: Book) => {
    addToCart(book)
    showToast(`"${book.title}" was added to your cart!`)
  }

  // ─── CRUD Handlers ────────────────────────────────────────

  const handleAddClick = () => {
    setEditingBook(null)
    setShowFormModal(true)
  }

  const handleEditClick = (book: Book) => {
    setEditingBook(book)
    setShowFormModal(true)
  }

  const handleDeleteClick = (book: Book) => {
    setDeletingBook(book)
    setShowDeleteModal(true)
  }

  const handleFormSave = async (bookData: Omit<Book, 'bookId'> & { bookId?: number }) => {
    setSaving(true)
    try {
      if (bookData.bookId) {
        // UPDATE
        const resp = await fetch(`${API_BASE_URL}/api/books/${bookData.bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        })
        if (!resp.ok) throw new Error(`Failed to update book: ${resp.status}`)
        showToast(`"${bookData.title}" was updated successfully!`)
      } else {
        // CREATE
        const resp = await fetch(`${API_BASE_URL}/api/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        })
        if (!resp.ok) throw new Error(`Failed to create book: ${resp.status}`)
        showToast(`"${bookData.title}" was added to the catalog!`)
      }
      setShowFormModal(false)
      setEditingBook(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'An error occurred', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingBook) return
    setDeleting(true)
    try {
      const resp = await fetch(`${API_BASE_URL}/api/books/${deletingBook.bookId}`, {
        method: 'DELETE',
      })
      if (!resp.ok) throw new Error(`Failed to delete book: ${resp.status}`)
      showToast(`"${deletingBook.title}" was deleted.`)
      setShowDeleteModal(false)
      setDeletingBook(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'An error occurred', 'danger')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Data Fetching ────────────────────────────────────────

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `${API_BASE_URL}/api/books?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`
        }

        const resp = await fetch(url)
        if (!resp.ok) {
          throw new Error(`Failed to load books: ${resp.status} ${resp.statusText}`)
        }

        const data: BooksApiResponse = await resp.json()
        setBooks(data.books)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [page, pageSize, sortBy, sortOrder, selectedCategory, refreshKey])

  const pageOptions = useMemo(() => [5, 10, 15, 20], [])

  /**
   * Safely updates the URL to navigate to a new page, ensuring the request 
   * doesn't fall out of bounds of the actual data.
   */
  const changePage = (newPage: number) => {
    const candidate = Math.max(1, Math.min(newPage, totalPages || 1))
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', candidate.toString())
    setSearchParams(newParams)
  }

  const resetPage = (newParams: URLSearchParams = new URLSearchParams(searchParams)) => {
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleTitleSort = () => {
    if (sortBy === 'title') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy('title')
      setSortOrder('asc')
    }
    resetPage()
  }

  const getTitleSortIndicator = () => {
    if (sortBy !== 'title') return ' ⇅'
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <section className="container-fluid px-4 py-4">
      <div className="row">
        {/* Category Sidebar Column */}
        <div className="col-12 col-md-3 mb-4 mb-md-0">
          <CategorySidebar />
        </div>
        
        {/* Main Books Table Column */}
        <div className="col-12 col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Add Book button */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">📚 Book Catalog</h5>
                <button className="btn-add-book" onClick={handleAddClick}>
                  + Add New Book
                </button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5 className="mt-3 text-muted">Retrieving Books...</h5>
                </div>
              ) : (
                <> 
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: '150px' }} className="text-center">Actions</th>
                          <th>Price</th>
                          <th>ID</th>
                          <th 
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={handleTitleSort}
                            title="Click to sort by title"
                          >
                            Title{getTitleSortIndicator()}
                          </th>
                          <th>Author</th>
                          <th>Publisher</th>
                          <th>ISBN</th>
                          <th>Category</th>
                          <th>Pages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book.bookId}>
                            <td className="text-center px-2">
                              <div className="d-flex gap-1 justify-content-center flex-wrap">
                                <button
                                  className="btn btn-sm btn-pastel"
                                  onClick={() => handleAddToCart(book)}
                                  title="Add to Cart"
                                >
                                  🛒
                                </button>
                                <button
                                  className="btn-action-edit"
                                  onClick={() => handleEditClick(book)}
                                  title="Edit Book"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-action-delete"
                                  onClick={() => handleDeleteClick(book)}
                                  title="Delete Book"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                            <td className="fw-bold text-success">${book.price.toFixed(2)}</td>
                            <td>{book.bookId}</td>
                            <td className="fw-bold">{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.publisher}</td>
                            <td><small className="text-muted">{book.isbn}</small></td>
                            <td>{book.category}</td>
                            <td>{book.pageCount}</td>
                          </tr>
                        ))}
                        {books.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center py-3">
                              No books found for this category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3 mt-3 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="btn-group btn-group-control" role="group">
                        <button
                          type="button"
                          className={`btn btn-sm ${sortBy === 'title' && sortOrder === 'asc' ? 'btn-control-primary' : 'btn-control-outline'}`}
                          onClick={() => {
                            setSortBy('title')
                            setSortOrder('asc')
                            resetPage()
                          }}
                        >
                          Title (A-Z)
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${sortBy === 'title' && sortOrder === 'desc' ? 'btn-control-primary' : 'btn-control-outline'}`}
                          onClick={() => {
                            setSortBy('title')
                            setSortOrder('desc')
                            resetPage()
                          }}
                        >
                          Title (Z-A)
                        </button>
                      </div>
                    </div>

                    <div className="text-start">
                      <p className="mb-0">
                        <strong>{total}</strong> total books
                      </p>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3 mt-3">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <label htmlFor="pageSize" className="form-label mb-0">
                        Results per page:
                      </label>
                      <select
                        id="pageSize"
                        className="form-select"
                        value={pageSize}
                        style={{ width: '90px' }}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value, 10))
                          resetPage()
                        }}
                      >
                        {pageOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      <div className="text-start ms-3">
                        <p className="mb-0">
                          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-control-outline"
                        onClick={() => changePage(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </button>

                      <select
                        className="form-select"
                        value={page}
                        style={{ width: '100px' }}
                        onChange={(e) => changePage(Number(e.target.value))}
                      >
                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                          <option key={pageNum} value={pageNum}>
                            Page {pageNum}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn btn-control-outline"
                        onClick={() => changePage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ─────────────────────────────────────── */}
      <BookFormModal
        show={showFormModal}
        book={editingBook}
        onClose={() => { setShowFormModal(false); setEditingBook(null) }}
        onSave={handleFormSave}
        saving={saving}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        bookTitle={deletingBook?.title ?? ''}
        onClose={() => { setShowDeleteModal(false); setDeletingBook(null) }}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* Bootstrap Toast Notification Container */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
        <div 
          className={`toast align-items-center border-0 ${toastMessage ? 'show' : 'hide'} ${toastVariant === 'danger' ? 'text-bg-danger' : 'text-bg-success'}`} 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              <span className="fw-bold me-2">{toastVariant === 'danger' ? 'Error!' : 'Success!'}</span> 
              {toastMessage}
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white me-2 m-auto" 
              onClick={() => setToastMessage(null)} 
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>

    </section>
  )
}

export default BookList
