import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CategorySidebar } from './CategorySidebar'
import { useCart } from '../context/CartContext'

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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5132'

function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()
  
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
  }, [page, pageSize, sortBy, sortOrder, selectedCategory])

  const pageOptions = useMemo(() => [5, 10, 15, 20], [])

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
    <section className="container py-4">
      <div className="row">
        {/* Category Sidebar Column */}
        <div className="col-12 col-md-3 mb-4 mb-md-0">
          <CategorySidebar />
        </div>
        
        {/* Main Books Table Column */}
        <div className="col-12 col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              {loading ? (
                <div className="alert alert-info">Loading books...</div>
              ) : (
                <> 
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
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
                          <th>Price</th>
                          <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book.bookId}>
                            <td>{book.bookId}</td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.publisher}</td>
                            <td>{book.isbn}</td>
                            <td>{book.category}</td>
                            <td>{book.pageCount}</td>
                            <td>${book.price.toFixed(2)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary w-100"
                                onClick={() => addToCart(book)}
                              >
                                Add to Cart
                              </button>
                            </td>
                          </tr>
                        ))}
                        {books.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-3">
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
    </section>
  )
}

export default BookList
