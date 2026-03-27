import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5132'

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
    // We update the category and explicitly reset the page to 1
    const newParams = new URLSearchParams()
    if (category) {
      newParams.set('category', category)
    }
    newParams.set('page', '1') // Ensure pagination resets
    setSearchParams(newParams)
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Categories</h5>
      </div>
      <div className="list-group list-group-flush">
        <button
          className={`list-group-item list-group-item-action ${!currentCategory ? 'active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All
        </button>
        {loading ? (
          <div className="list-group-item">Loading...</div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              className={`list-group-item list-group-item-action ${currentCategory === cat ? 'active' : ''}`}
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
