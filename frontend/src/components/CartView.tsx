import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

/**
 * CartView Component
 * Renders the dedicated checkout/cart page. Displays an interactive table of 
 * cart items mapped from the global CartContext, allowing quantity updates 
 * and line-item removals. Calculates dynamic subtotals directly in the view.
 */
export function CartView() {
  // Unpack context functions and derived calculations
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart()
  // React Router hook for programmatic navigation
  const navigate = useNavigate()

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Shopping Cart</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Continue Shopping
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {/* Empty Cart State: Prompts user to return to the catalog */}
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">Your cart is empty.</h4>
              <p>Looks like you haven't added any books yet.</p>
              <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                Browse Books
              </button>
            </div>
          ) : (
            <>
              {/* Active Cart State: Displays the line-item table */}
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Book</th>
                      <th>Price</th>
                      <th style={{ width: '150px' }}>Quantity</th>
                      <th className="text-end">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.book.bookId}>
                        <td>
                          <h6 className="mb-0">{item.book.title}</h6>
                          <small className="text-muted">{item.book.author}</small>
                        </td>
                        <td>${item.book.price.toFixed(2)}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.book.bookId, parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td className="text-end">
                          <strong>${(item.book.price * item.quantity).toFixed(2)}</strong>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFromCart(item.book.bookId)}
                            title="Remove from cart"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end">
                        <h5 className="mb-0">Total:</h5>
                      </td>
                      <td className="text-end">
                        <h4 className="mb-0 text-success">${cartTotal.toFixed(2)}</h4>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-danger" onClick={clearCart}>
                  Clear Cart
                </button>
                <button className="btn btn-success btn-lg">
                  Proceed to Checkout &rarr;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
