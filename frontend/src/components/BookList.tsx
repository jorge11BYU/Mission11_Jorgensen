import { useEffect, useMemo, useState } from 'react'

/**
 * Type definition for individual book records from the database
 * Matches the Book model from the C# backend
 */
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

/**
 * Type definition for the API response from GET /api/books
 * Includes pagination metadata and the books array
 */
type BooksApiResponse = {
  total: number
  page: number
  pageSize: number
  totalPages: number
  books: Book[]
}

// API endpoint - uses environment variable or defaults to local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138'

/**
 * BookList Component - Main data table with pagination and sorting controls
 * Features:
 * - Displays books in a responsive table
 * - Pagination with customizable page size (5, 10, 15, 20 books per page)
 * - Sort by book title (A-Z / Z-A)
 * - Jump to any page via dropdown selector
 * - Error handling and loading states
 */
function BookList() {
  // Component state management
  const [books, setBooks] = useState<Book[]>([]) // Array of books for current page
  const [page, setPage] = useState(1) // Current page number (1-based)
  const [pageSize, setPageSize] = useState(5) // Number of books to display per page
  const [totalPages, setTotalPages] = useState(1) // Total number of pages available
  const [total, setTotal] = useState(0) // Total number of books in database
  const [loading, setLoading] = useState(false) // Loading state for API calls
  const [error, setError] = useState<string | null>(null) // Error message if fetch fails
  const [sortBy, setSortBy] = useState('id') // Current sort column (id or title)
  const [sortOrder, setSortOrder] = useState('asc') // Sort direction (asc or desc)

  /**
   * Effect: Fetch books whenever pagination, page size, or sorting changes
   * Constructs API URL with current filter/sort parameters and updates component state
   * Dependency array ensures refetch on: page, pageSize, sortBy, or sortOrder changes
   */
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      setError(null)
      try {
        // Build API URL with query parameters for pagination and sorting
        const url = `${API_BASE_URL}/api/books?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        const resp = await fetch(url)

        if (!resp.ok) {
          throw new Error(`Failed to load books: ${resp.status} ${resp.statusText}`)
        }

        // Parse response and update state with books, total count, and page count
        const data: BooksApiResponse = await resp.json()
        setBooks(data.books)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (e) {
        // Capture and display error messages
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [page, pageSize, sortBy, sortOrder])

  // Available options for results per page - shown in dropdown selector
  const pageOptions = useMemo(() => [5, 10, 15, 20], [])

  /**
   * Navigate to a specific page with bounds checking
   * Ensures new page is between 1 and totalPages
   * @param newPage - The page number to navigate to (1-based index)
   */
  const changePage = (newPage: number) => {
    // Clamp the requested page between 1 and totalPages
    const candidate = Math.max(1, Math.min(newPage, totalPages || 1))
    setPage(candidate)
  }

  /**
   * Handle title column header click to toggle sort order
   * If already sorting by title, toggle between asc/desc
   * If sorting by something else, start sorting by title ascending
   */
  const handleTitleSort = () => {
    if (sortBy === 'title') {
      // Toggle sort direction if already sorting by title
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Start sorting by title in ascending order
      setSortBy('title')
      setSortOrder('asc')
    }
    // Reset to first page when sort changes
    setPage(1)
  }

  /**
   * Return visual indicator for sort state of title column
   * ⇅ = column not sorted, ↑ = ascending, ↓ = descending
   */
  const getTitleSortIndicator = () => {
    if (sortBy !== 'title') return ' ⇅'
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }


  return (
    <section className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          {/* Display error message if API call fails */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Show loading state while fetching data */}
          {loading ? (
            <div className="alert alert-info">Loading books...</div>
          ) : (
            <> 
              {/* MAIN TABLE: Display books with all relevant columns */}
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      {/* Title column is clickable for sorting */}
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
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render each book as a table row */}
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
                      </tr>
                    ))}
                    {/* Show message if no books found for current filter */}
                    {books.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-3">
                          No books found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* SORT CONTROLS SECTION - Top row with sort buttons and total books count */}
              <div className="d-flex justify-content-between align-items-center gap-3 mt-3 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Sort buttons for title ascending/descending */}
                  <div className="btn-group btn-group-control" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${sortBy === 'title' && sortOrder === 'asc' ? 'btn-control-primary' : 'btn-control-outline'}`}
                      onClick={() => {
                        setSortBy('title')
                        setSortOrder('asc')
                        setPage(1)
                      }}
                      title="Sort by title A-Z"
                    >
                      Title (A-Z)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${sortBy === 'title' && sortOrder === 'desc' ? 'btn-control-primary' : 'btn-control-outline'}`}
                      onClick={() => {
                        setSortBy('title')
                        setSortOrder('desc')
                        setPage(1)
                      }}
                      title="Sort by title Z-A"
                    >
                      Title (Z-A)
                    </button>
                  </div>
                </div>

                {/* Total books count display */}
                <div className="text-start">
                  <p className="mb-0">
                    <strong>{total}</strong> total books
                  </p>
                </div>
              </div>

              {/* PAGINATION CONTROLS SECTION - Bottom row with page size, page selector, and navigation */}
              <div className="d-flex justify-content-between align-items-center gap-3 mt-3">
                {/* Left side: Results per page and page info */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Dropdown to select how many results per page */}
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
                      setPage(1) // Reset to first page when page size changes
                    }}
                  >
                    {pageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {/* Current page and total pages info */}
                  <div className="text-start ms-3">
                    <p className="mb-0">
                      Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
                    </p>
                  </div>
                </div>

                {/* Right side: Previous/Next buttons and page selector dropdown */}
                <div className="d-flex align-items-center gap-2">
                  {/* Previous page button */}
                  <button
                    className="btn btn-control-outline"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>

                  {/* Dropdown to jump to any page directly */}
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

                  {/* Next page button */}
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
    </section>
  )
}

export default BookList
