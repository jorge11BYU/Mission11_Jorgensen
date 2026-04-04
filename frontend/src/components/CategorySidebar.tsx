import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://mission13-jorgensen-backend-ckbxgyafacb7g0dx.francecentral-01.azurewebsites.net'

/**
 * CategorySidebar Component
 * 
 * Fetches distinct book categories from the backend and renders them as a vertical 
 * list of buttons. It delegates state management entirely to React Router by injecting 
 * the selected category into the URL query parameters (`?category=X`).
 */
export function CategorySidebar() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentCategory = searchParams.get('category') || ''

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const resp = await fetch(`${API_BASE_URL}/api/books/categories`)
        if (resp.ok) {
          const data = await resp.json()
          setCategories(data)
        }
      } catch (e) {
        console.error('Failed to load categories', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (category: string) => {
    // Generate new URL parameters based on the clicked category
    const newParams = new URLSearchParams()
    if (category) {
      newParams.set('category', category)
    }
    // CRITICAL: Always reset the page to 1 when changing categories. 
    // Failing to do so could leave the user on "Page 5" of a category that only has 1 page of books.
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Categories</h5>
      </div>
      <div className="list-group list-group-flush">
        <button
          className={`list-group-item list-group-item-action ${!currentCategory ? 'active pastel-active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All
        </button>
        {loading ? (
          <div className="list-group-item text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading categories...</span>
            </div>
          </div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              className={`list-group-item list-group-item-action ${currentCategory === cat ? 'active pastel-active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
