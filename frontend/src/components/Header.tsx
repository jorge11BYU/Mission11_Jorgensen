import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

/**
 * Header Component - Displays the application banner at the top of the page
 * Features:
 * - Application title ("Bookstore") linking to home
 * - Live updating Cart Summary widget displaying items and total price
 */
function Header() {
  const { cartCount, cartTotal } = useCart()

  return (
    <header className="bg-primary text-white py-3 mb-4 w-100 shadow-sm">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <Link to="/" className="text-decoration-none text-white">
            <h1 className="h3 fw-bold mb-0">Bookstore</h1>
            <p className="small mb-0">Browse our collection of books</p>
          </Link>
        </div>
        <div>
          <Link to="/cart" className="btn btn-light rounded-pill px-3 shadow-sm fw-bold">
            🛒 Cart 
            <span className="badge bg-primary rounded-pill mx-2">{cartCount}</span>
            <span className="text-success">${cartTotal.toFixed(2)}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
